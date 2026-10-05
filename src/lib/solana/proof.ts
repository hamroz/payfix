import bs58 from "bs58";
import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";

/**
 * The message a customer signs with the refund wallet. Signing proves they control the
 * destination today, which also catches typos and exchange deposit addresses they
 * can't sign from.
 */
export function destinationProofMessage(p: { caseId: string; destination: string; nonce: string }): string {
  return [
    "PayFix refund destination",
    "",
    "I control this wallet and want my PayFix refund sent here.",
    `Case: ${p.caseId}`,
    `Destination: ${p.destination}`,
    `Nonce: ${p.nonce}`,
  ].join("\n");
}

/**
 * The message a business signs to add a receiving wallet. Signing proves the wallet exists
 * and is theirs, so a mistyped address can't silently send customer payments elsewhere.
 */
export function walletOwnershipMessage(p: { address: string; issuedAt: string }): string {
  return ["PayFix receiving wallet", "", "I control this wallet and want PayFix payments sent to it.", `Wallet: ${p.address}`, `Issued: ${p.issuedAt}`].join("\n");
}

export type OwnershipProof = { message: string; signature: string };

export function verifyWalletSignature(message: string, signatureB58: string, address: string): boolean {
  try {
    return nacl.sign.detached.verify(new TextEncoder().encode(message), bs58.decode(signatureB58), new PublicKey(address).toBytes());
  } catch {
    return false;
  }
}
