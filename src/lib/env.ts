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
  SOLANA_RPC_URL: z.string().optional().transform((v) => v || undefined),
  PAYFIX_MINT: z.string().optional().transform((v) => v || undefined),
  PAYFIX_MINT_DECIMALS: z.coerce.number().int().min(0).max(9).default(6),
  PAYFIX_TOKEN_LABEL: z.string().optional().transform((v) => v || undefined),
  DEMO_MODE: bool,
  DEMO_TREASURY_SECRET: z.string().optional().transform((v) => v || undefined),
  DEMO_MERCHANT_SECRET: z.string().optional().transform((v) => v || undefined),
  DEMO_CUSTOMER_SECRET: z.string().optional().transform((v) => v || undefined),
  // Outside demo mode, sign-in codes and links are emailed through Resend.
  RESEND_API_KEY: z.string().optional().transform((v) => v || undefined),
  // Resend's shared test sender until a domain is verified (it only delivers to the account owner).
  EMAIL_FROM: z.string().optional().transform((v) => v || "PayFix <onboarding@resend.dev>"),
  // Where the production site sends people who want to try the devnet demo.
  DEMO_URL: z.string().optional().transform((v) => v || undefined),
  // Shown on the legal pages for privacy requests and security reports. Unset = a generic contact sentence.
  CONTACT_EMAIL: z.string().optional().transform((v) => v?.trim() || undefined),
  // Platform admins (comma-separated). Checked on every admin request, so removing an address revokes access.
  ADMIN_EMAILS: z
    .string()
    .optional()
    .transform((v) => (v ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)),
});

export type Env = Omit<z.infer<typeof schema>, "SOLANA_CLUSTER" | "SOLANA_RPC_URL" | "PAYFIX_TOKEN_LABEL"> & {
  SOLANA_CLUSTER: "devnet" | "mainnet-beta" | "localnet" | "simulated";
  SOLANA_RPC_URL: string;
  PAYFIX_TOKEN_LABEL: string;
};

let cached: Env | undefined;

/** Deterministic mint address used by the simulated chain (sha256("payfix-simulated-mint") seed). */
export const SIMULATED_MINT = "22eW8z2VL3HYNoYZRNb8HpXEkp6sBvf3xvfsso3F87YR";
/** Circle's USDC on Solana mainnet. */
export const MAINNET_USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const INSECURE_SECRET = "dev-insecure-session-secret-change-me";

const RPC_DEFAULTS = {
  devnet: "https://api.devnet.solana.com",
  "mainnet-beta": "https://api.mainnet-beta.solana.com",
  localnet: "http://127.0.0.1:8899",
  simulated: "https://api.devnet.solana.com",
} as const;

/** Tests only: forget the parsed environment so the next `env()` re-reads `process.env`. */
export function resetEnvForTests() {
  cached = undefined;
}

export function env(): Env {
  if (cached) return cached;
  const raw = schema.parse(process.env);
  // No configured test mint → simulated chain with demo mode on, so `npm run dev` just works.
  const cluster = raw.SOLANA_CLUSTER ?? (raw.PAYFIX_MINT ? "devnet" : "simulated");
  const mainnet = cluster === "mainnet-beta";
  const parsed: Env = {
    ...raw,
    SOLANA_CLUSTER: cluster,
    SOLANA_RPC_URL: raw.SOLANA_RPC_URL ?? RPC_DEFAULTS[cluster],
    DEMO_MODE: cluster === "simulated" ? true : raw.DEMO_MODE,
    PAYFIX_MINT: cluster === "simulated" ? SIMULATED_MINT : (raw.PAYFIX_MINT ?? (mainnet ? MAINNET_USDC : undefined)),
    PAYFIX_TOKEN_LABEL: raw.PAYFIX_TOKEN_LABEL ?? (mainnet ? "USDC" : "Test USD"),
  };
  if (parsed.DEMO_MODE && mainnet) {
    throw new Error("DEMO_MODE cannot run against mainnet. Demo wallets and the faucet are devnet-only.");
  }
  if (mainnet && parsed.SESSION_SECRET === INSECURE_SECRET) {
    throw new Error("Set SESSION_SECRET before running on mainnet (openssl rand -base64 32).");
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
    mainnet: e.SOLANA_CLUSTER === "mainnet-beta",
    demoUrl: e.DEMO_URL ?? null,
  };
}

export type PublicConfig = ReturnType<typeof publicConfig>;
