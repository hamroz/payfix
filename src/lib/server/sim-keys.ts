import { createHash } from "node:crypto";
import { Keypair } from "@solana/web3.js";

const seeded = (name: string) => Keypair.fromSeed(createHash("sha256").update(`payfix-simulated-${name}`).digest());

/** Fixed demo wallets for the simulated chain. They hold no real value anywhere. */
export function simulatedKeys() {
  return { treasury: seeded("treasury"), merchant: seeded("merchant"), customer: seeded("customer") };
}
