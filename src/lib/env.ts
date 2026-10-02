import { z } from "zod";

const bool = z
  .string()
  .optional()
  .transform((v) => v === "true" || v === "1");

const schema = z.object({
  // On Vercel, default to the project's production domain (a system env var Vercel sets).
  APP_URL: z
    .string()
    .optional()
    .transform((v) => v || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")),
  DATABASE_URL: z.string().optional().transform((v) => v || undefined),
  PGLITE_DIR: z.string().default(".data/pglite"),
  SESSION_SECRET: z.string().default("dev-insecure-session-secret-change-me"),
  // "simulated" runs an in-process chain so the app works with zero setup; it is always labeled in the UI.
  SOLANA_CLUSTER: z.preprocess((v) => v || undefined, z.enum(["devnet", "mainnet-beta", "localnet", "simulated"]).optional()),
  SOLANA_RPC_URL: z.string().default("https://api.devnet.solana.com"),
  PAYFIX_MINT: z.string().optional().transform((v) => v || undefined),
  PAYFIX_MINT_DECIMALS: z.coerce.number().int().min(0).max(9).default(6),
  PAYFIX_TOKEN_LABEL: z.string().default("Test USD"),
  DEMO_MODE: bool,
  DEMO_TREASURY_SECRET: z.string().optional().transform((v) => v || undefined),
  DEMO_MERCHANT_SECRET: z.string().optional().transform((v) => v || undefined),
  DEMO_CUSTOMER_SECRET: z.string().optional().transform((v) => v || undefined),
});

export type Env = Omit<z.infer<typeof schema>, "SOLANA_CLUSTER"> & {
  SOLANA_CLUSTER: "devnet" | "mainnet-beta" | "localnet" | "simulated";
};

let cached: Env | undefined;

/** Deterministic mint address used by the simulated chain (sha256("payfix-simulated-mint") seed). */
export const SIMULATED_MINT = "22eW8z2VL3HYNoYZRNb8HpXEkp6sBvf3xvfsso3F87YR";

export function env(): Env {
  if (cached) return cached;
  const raw = schema.parse(process.env);
  // No configured test mint → simulated chain with demo mode on, so `npm run dev` just works.
  const cluster = raw.SOLANA_CLUSTER ?? (raw.PAYFIX_MINT ? "devnet" : "simulated");
  const parsed: Env = {
    ...raw,
    SOLANA_CLUSTER: cluster,
    DEMO_MODE: cluster === "simulated" ? true : raw.DEMO_MODE,
    PAYFIX_MINT: cluster === "simulated" ? SIMULATED_MINT : raw.PAYFIX_MINT,
  };
  if (parsed.DEMO_MODE && parsed.SOLANA_CLUSTER === "mainnet-beta") {
    throw new Error("DEMO_MODE cannot run against mainnet. Demo wallets and the faucet are devnet-only.");
  }
  cached = parsed;
  return parsed;
}

/** Values that are safe to hand to the browser. */
export function publicConfig() {
  const e = env();
  return {
    cluster: e.SOLANA_CLUSTER,
    rpcUrl: e.SOLANA_RPC_URL,
    mint: e.PAYFIX_MINT ?? null,
    decimals: e.PAYFIX_MINT_DECIMALS,
    tokenLabel: e.PAYFIX_TOKEN_LABEL,
    demoMode: e.DEMO_MODE,
    simulated: e.SOLANA_CLUSTER === "simulated",
  };
}

export type PublicConfig = ReturnType<typeof publicConfig>;
