/**
 * Gives the devnet test token a name, symbol, and logo, so wallets like Phantom show
 * "PayFix Test USD" instead of an unknown token.
 *
 *   npm run setup:token-metadata                       # metadata JSON from the live demo
 *   npm run setup:token-metadata -- --uri <json url>   # or from somewhere else
 *
 * Writes a Metaplex token-metadata account for PAYFIX_MINT, signed by the treasury (the
 * mint authority). Running it again updates the existing account. Devnet only.
 */
import { existsSync, readFileSync } from "node:fs";
import bs58 from "bs58";
import { Connection, Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction, sendAndConfirmTransaction } from "@solana/web3.js";

const METADATA_PROGRAM = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
const NAME = "PayFix Test USD";
const SYMBOL = "tUSD";

function readEnv() {
  const map = new Map<string, string>();
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !map.has(m[1])) map.set(m[1], m[2].replace(/^"|"$/g, ""));
    }
  }
  return map;
}

// Borsh encoding, just the shapes this instruction needs.
const u8 = (n: number) => Buffer.from([n]);
const u16 = (n: number) => Buffer.from([n & 0xff, n >> 8]);
const str = (s: string) => {
  const b = Buffer.from(s, "utf8");
  const len = Buffer.alloc(4);
  len.writeUInt32LE(b.length);
  return Buffer.concat([len, b]);
};
/** DataV2: name, symbol, uri, seller fee, and no creators, collection, or uses. */
const dataV2 = (uri: string) => Buffer.concat([str(NAME), str(SYMBOL), str(uri), u16(0), u8(0), u8(0), u8(0)]);

async function main() {
  const env = readEnv();
  const cluster = env.get("SOLANA_CLUSTER") ?? "devnet";
  if (cluster === "mainnet-beta") throw new Error("Refusing to run on mainnet: this names the devnet test token.");
  const mintAddress = env.get("PAYFIX_MINT");
  const secret = env.get("DEMO_TREASURY_SECRET");
  if (!mintAddress || !secret) throw new Error("PAYFIX_MINT and DEMO_TREASURY_SECRET are needed. Run `npm run setup:devnet` first.");
  const i = process.argv.indexOf("--uri");
  const uri = i > 0 ? process.argv[i + 1] : "https://payfix-mu.vercel.app/token/test-usd.json";

  const conn = new Connection(env.get("SOLANA_RPC_URL") || "https://api.devnet.solana.com", "confirmed");
  const treasury = Keypair.fromSecretKey(secret.startsWith("[") ? Uint8Array.from(JSON.parse(secret)) : bs58.decode(secret));
  const mint = new PublicKey(mintAddress);
  const [metadata] = PublicKey.findProgramAddressSync([Buffer.from("metadata"), METADATA_PROGRAM.toBuffer(), mint.toBuffer()], METADATA_PROGRAM);

  const exists = (await conn.getAccountInfo(metadata)) !== null;
  const ix = exists
    ? // UpdateMetadataAccountV2: Some(data), no new authority, primary-sale and mutability unchanged.
      new TransactionInstruction({
        programId: METADATA_PROGRAM,
        keys: [
          { pubkey: metadata, isSigner: false, isWritable: true },
          { pubkey: treasury.publicKey, isSigner: true, isWritable: false },
        ],
        data: Buffer.concat([u8(15), u8(1), dataV2(uri), u8(0), u8(0), u8(0)]),
      })
    : // CreateMetadataAccountV3: data, mutable, no collection details.
      new TransactionInstruction({
        programId: METADATA_PROGRAM,
        keys: [
          { pubkey: metadata, isSigner: false, isWritable: true },
          { pubkey: mint, isSigner: false, isWritable: false },
          { pubkey: treasury.publicKey, isSigner: true, isWritable: false },
          { pubkey: treasury.publicKey, isSigner: true, isWritable: true },
          { pubkey: treasury.publicKey, isSigner: true, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        ],
        data: Buffer.concat([u8(33), dataV2(uri), u8(1), u8(0)]),
      });

  const sig = await sendAndConfirmTransaction(conn, new Transaction().add(ix), [treasury], { commitment: "confirmed" });
  console.log(`${exists ? "Updated" : "Created"} metadata for ${mint.toBase58()}: ${NAME} (${SYMBOL})`);
  console.log(`  uri: ${uri}`);
  console.log(`  tx:  https://explorer.solana.com/tx/${sig}?cluster=${cluster}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
