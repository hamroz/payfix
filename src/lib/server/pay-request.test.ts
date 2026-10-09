import { beforeAll, describe, expect, it } from "vitest";
import { decodeTransferCheckedInstruction } from "@solana/spl-token";
import { Keypair, Transaction } from "@solana/web3.js";
import { openPglite, type Db } from "@/lib/db/client";
import { businesses } from "@/lib/db/schema";
import { toUnits } from "@/lib/money";
import { ata } from "@/lib/solana/tx";
import { syncBusiness } from "./ingest";
import { SimChain } from "./sim-chain";
import { buildRequestedPayment, createCustomer, createInvoice, createPaymentRequest, paymentRequestLabel } from "./invoices";

// The payment QR code: a Solana Pay transaction request whenever the wallet can reach us, so
// wallets that can't read the test token's balance (Phantom) still pay the exact amount.
describe("payment QR transaction requests", () => {
  let db: Db;
  let chain: SimChain;
  let invoiceId: string;
  const merchant = Keypair.generate().publicKey;
  const payer = Keypair.generate().publicKey;
  const mint = Keypair.generate().publicKey;
  const appUrl = "https://pay.example";

  beforeAll(async () => {
    db = await openPglite();
    chain = new SimChain(mint.toBase58());
    await db.insert(businesses).values({ id: "biz_qr", name: "Lumen Studio", ownerEmail: "owner@lumen.test", walletAddress: merchant.toBase58(), mint: mint.toBase58() });
    const customerId = await createCustomer(db, { businessId: "biz_qr", name: "Acme Robotics", email: "ap@acme.test" });
    invoiceId = (await createInvoice(db, { businessId: "biz_qr", customerId, title: "Brand identity", amount: toUnits("1000"), dueAt: new Date(Date.now() + 864e5) })).id;
  });

  it("links to the transaction request endpoint on a public HTTPS origin", async () => {
    const req = await createPaymentRequest(db, { invoiceId, amount: toUnits("0.1"), appUrl });
    expect(req.url).toBe(`solana:${appUrl}/api/pay/${req.reference}`);
    expect(await paymentRequestLabel(db, req.reference)).toBe("Lumen Studio");
  });

  it("falls back to a transfer request without an amount or on a local http origin", async () => {
    const open = await createPaymentRequest(db, { invoiceId, amount: null, appUrl });
    expect(open.url).toMatch(new RegExp(`^solana:${merchant.toBase58()}\\?`));
    const local = await createPaymentRequest(db, { invoiceId, amount: toUnits("5"), appUrl: "http://localhost:3000" });
    expect(local.url).toContain(`spl-token=${mint.toBase58()}`);
  });

  it("builds the exact unsigned payment for the scanning wallet, tagged with the reference", async () => {
    const req = await createPaymentRequest(db, { invoiceId, amount: toUnits("0.1"), appUrl });
    const res = await buildRequestedPayment({ db, chain }, { reference: req.reference, account: payer.toBase58() });
    expect(res.message).toBe("INV-0001 · Brand identity");

    const tx = Transaction.from(Buffer.from(res.transaction, "base64"));
    expect(tx.feePayer?.toBase58()).toBe(payer.toBase58());
    expect(tx.recentBlockhash).toBeTruthy();
    expect(tx.signatures.every((s) => s.signature === null)).toBe(true);

    const transfer = decodeTransferCheckedInstruction(tx.instructions[1]);
    expect(transfer.data.amount).toBe(toUnits("0.1"));
    expect(transfer.data.decimals).toBe(6);
    expect(transfer.keys.source.pubkey.toBase58()).toBe(ata(mint, payer).toBase58());
    expect(transfer.keys.destination.pubkey.toBase58()).toBe(ata(mint, merchant).toBase58());
    expect(transfer.keys.owner.pubkey.toBase58()).toBe(payer.toBase58());
    expect(transfer.keys.multiSigners.map((k) => k.pubkey.toBase58())).toEqual([req.reference]);
    expect(transfer.keys.multiSigners[0].isSigner).toBe(false);
  });

  it("refuses unknown references, open-amount requests, and non-wallet accounts", async () => {
    const account = payer.toBase58();
    await expect(buildRequestedPayment({ db, chain }, { reference: Keypair.generate().publicKey.toBase58(), account })).rejects.toThrow(/isn't valid/);
    const open = await createPaymentRequest(db, { invoiceId, amount: null, appUrl });
    await expect(buildRequestedPayment({ db, chain }, { reference: open.reference, account })).rejects.toThrow(/isn't valid/);
    const req = await createPaymentRequest(db, { invoiceId, amount: toUnits("1"), appUrl });
    await expect(buildRequestedPayment({ db, chain }, { reference: req.reference, account: "not-a-wallet" })).rejects.toThrow(/wallet address/);
  });

  it("stops taking payments once the invoice is paid in full, including codes issued earlier", async () => {
    const customerId = await createCustomer(db, { businessId: "biz_qr", name: "Kite Labs", email: "ap@kite.test" });
    const id = (await createInvoice(db, { businessId: "biz_qr", customerId, title: "Logo refresh", amount: toUnits("200"), dueAt: new Date(Date.now() + 864e5) })).id;
    const stale = await createPaymentRequest(db, { invoiceId: id, amount: toUnits("200"), appUrl });

    chain.fund(payer.toBase58(), toUnits("200"));
    const paid = await createPaymentRequest(db, { invoiceId: id, amount: null, appUrl });
    chain.transfer({ from: payer.toBase58(), to: merchant.toBase58(), amount: toUnits("200"), reference: paid.reference });
    await syncBusiness({ db, chain }, "biz_qr");

    await expect(createPaymentRequest(db, { invoiceId: id, amount: toUnits("50"), appUrl })).rejects.toThrow(/already paid/);
    await expect(createPaymentRequest(db, { invoiceId: id, amount: null, appUrl })).rejects.toThrow(/already paid/);
    await expect(buildRequestedPayment({ db, chain }, { reference: stale.reference, account: payer.toBase58() })).rejects.toThrow(/already paid/);
  });
});
