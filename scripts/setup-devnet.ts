/**
 * One-time devnet setup for the PayFix demo.
 *
 *   npm run setup:devnet            # create keys, test mint, fund demo wallets
 *   npm run setup:devnet -- --to <wallet>   # also send test USD + a little SOL to your own wallet
 *
 * Creates (or reuses from .env.local) three devnet keypairs:
 *   treasury  – pays fees and is the mint authority of the PayFix test token
 *   merchant  – the demo business's receiving wallet (signs refunds in demo mode)
 *   customer  – the demo customer's paying wallet
 * Everything here is devnet test money. It refuses to run against mainnet.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import bs58 from "bs58";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

const ENV_FILE = ".env.local";
const DECIMALS = 6;

function readEnv(): Map<string, string> {
  const map = new Map<string, string>();
  const src = existsSync(ENV_FILE) ? ENV_FILE : ".env.example";
  for (const line of readFileSync(src, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) map.set(m[1], m[2]);
  }
  return map;
}

function writeEnv(values: Map<string, string>) {
  const template = readFileSync(".env.example", "utf8").split("\n");
  const written = new Set<string>();
  const out = template.map((line) => {
    const m = line.match(/^([A-Z0-9_]+)=/);
    if (!m) return line;
    written.add(m[1]);
    return `${m[1]}=${values.get(m[1]) ?? ""}`;
  });
  for (const [k, v] of values) if (!written.has(k)) out.push(`${k}=${v}`);
  writeFileSync(ENV_FILE, out.join("\n"));
}

const keypair = (secret: string | undefined) => (secret ? Keypair.fromSecretKey(bs58.decode(secret)) : Keypair.generate());

async function airdrop(connection: Connection, to: PublicKey, sol: number) {
  for (let i = 0; i < 3; i++) {
    try {
      const sig = await connection.requestAirdrop(to, sol * LAMPORTS_PER_SOL);
      const bh = await connection.getLatestBlockhash();
      await connection.confirmTransaction({ signature: sig, ...bh }, "confirmed");
      return true;
    } catch (err) {
      console.warn(`  airdrop attempt ${i + 1} failed: ${(err as Error).message.slice(0, 120)}`);
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
  return false;
}

async function main() {
  const env = readEnv();
  const cluster = env.get("SOLANA_CLUSTER") && env.get("SOLANA_CLUSTER") !== "simulated" ? env.get("SOLANA_CLUSTER")! : "devnet";
  if (cluster === "mainnet-beta") throw new Error("setup:devnet refuses to run against mainnet.");
  const rpc = env.get("SOLANA_RPC_URL") || "https://api.devnet.solana.com";
  const connection = new Connection(rpc, "confirmed");
  const toArg = process.argv.indexOf("--to");
  const extraWallet = toArg > 0 ? new PublicKey(process.argv[toArg + 1]) : null;

  const treasury = keypair(env.get("DEMO_TREASURY_SECRET"));
  const merchant = keypair(env.get("DEMO_MERCHANT_SECRET"));
  const customer = keypair(env.get("DEMO_CUSTOMER_SECRET"));
  env.set("DEMO_TREASURY_SECRET", bs58.encode(treasury.secretKey));
  env.set("DEMO_MERCHANT_SECRET", bs58.encode(merchant.secretKey));
  env.set("DEMO_CUSTOMER_SECRET", bs58.encode(customer.secretKey));
  env.set("DEMO_MODE", "true");
  env.set("SOLANA_RPC_URL", rpc);
  if (!env.get("SESSION_SECRET") || env.get("SESSION_SECRET")!.startsWith("change-me")) env.set("SESSION_SECRET", bs58.encode(Keypair.generate().secretKey));
  writeEnv(env); // persist keys early so a failed airdrop doesn't lose them

  console.log(`\nPayFix devnet setup (${rpc})`);
  console.log(`  treasury  ${treasury.publicKey.toBase58()}`);
  console.log(`  merchant  ${merchant.publicKey.toBase58()}`);
  console.log(`  customer  ${customer.publicKey.toBase58()}\n`);

  const balance = await connection.getBalance(treasury.publicKey);
  if (balance < 0.25 * LAMPORTS_PER_SOL) {
    console.log("Requesting devnet SOL for the treasury…");
    if (!(await airdrop(connection, treasury.publicKey, 1))) {
      console.error(
        `\nThe public devnet faucet is rate limited. Fund the treasury manually, then rerun this script:\n` +
          `  https://faucet.solana.com  →  ${treasury.publicKey.toBase58()}\n`,
      );
      process.exit(1);
    }
  }

  // Give the merchant and customer enough SOL for fees and token-account rent.
  const topUp = new Transaction();
  for (const who of [merchant.publicKey, customer.publicKey, ...(extraWallet ? [extraWallet] : [])]) {
    if ((await connection.getBalance(who)) < 0.05 * LAMPORTS_PER_SOL)
      topUp.add(SystemProgram.transfer({ fromPubkey: treasury.publicKey, toPubkey: who, lamports: 0.1 * LAMPORTS_PER_SOL }));
  }
  if (topUp.instructions.length) {
    await sendAndConfirmTransaction(connection, topUp, [treasury]);
    console.log("Funded merchant/customer wallets with devnet SOL for fees.");
  }

  let mint = env.get("PAYFIX_MINT") ? new PublicKey(env.get("PAYFIX_MINT")!) : null;
  if (mint && !(await connection.getAccountInfo(mint))) mint = null;
  if (!mint) {
    mint = await createMint(connection, treasury, treasury.publicKey, null, DECIMALS);
    console.log(`Created test token mint ${mint.toBase58()} (${DECIMALS} decimals)`);
  } else {
    console.log(`Reusing test token mint ${mint.toBase58()}`);
  }
  env.set("PAYFIX_MINT", mint.toBase58());
  env.set("PAYFIX_MINT_DECIMALS", String(DECIMALS));
  env.set("SOLANA_CLUSTER", cluster); // only once the mint exists; until then the app runs simulated

  await getOrCreateAssociatedTokenAccount(connection, treasury, mint, merchant.publicKey);
  const customerAta = await getOrCreateAssociatedTokenAccount(connection, treasury, mint, customer.publicKey);
  if (customerAta.amount < 5_000n * 10n ** BigInt(DECIMALS)) {
    await mintTo(connection, treasury, mint, customerAta.address, treasury, 10_000n * 10n ** BigInt(DECIMALS));
    console.log("Minted 10,000 test USD to the demo customer.");
  }
  if (extraWallet) {
    const ata = await getOrCreateAssociatedTokenAccount(connection, treasury, mint, extraWallet);
    await mintTo(connection, treasury, mint, ata.address, treasury, 5_000n * 10n ** BigInt(DECIMALS));
    console.log(`Minted 5,000 test USD to ${extraWallet.toBase58()}.`);
  }

  writeEnv(env);
  console.log(
    `\nDone. Wrote ${ENV_FILE}.\n` +
      `  Docker:     docker compose down -v && npm run docker:up   (fresh demo data on devnet)\n` +
      `  Local dev:  restart npm run dev\n`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
