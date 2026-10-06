# Deployment

PayFix runs as **two deployments of the same code**: a public **demo** on devnet (what judges and testers use) and a **production** site on mainnet with demo features off. They never share a database or keys.

| Setting | Demo (devnet) | Production (mainnet) |
| --- | --- | --- |
| `SOLANA_CLUSTER` | `devnet` | `mainnet-beta` |
| `SOLANA_RPC_URL` | public devnet | a paid RPC (Helius, Triton, QuickNode…); the public endpoint is rate limited |
| `PAYFIX_MINT` / label | test mint / "Test USD" | empty → Circle's USDC / "USDC" |
| `DEMO_MODE` | `true` | `false` (startup refuses demo mode on mainnet) |
| Email | demo inbox in the app | `RESEND_API_KEY` + `EMAIL_FROM` on a verified domain |
| `SESSION_SECRET` | random | random and different (startup refuses the default on mainnet) |
| `DEMO_URL` | — | the demo's URL, for the landing page's "Try the live demo" |
| `DATABASE_URL` | its own Neon database | its own Neon database, in the **same region** as the functions |

What production mode changes:

- **No demo machinery:** no demo inbox, demo wallets, faucet, server-held keys, or reset. Refunds are always signed in the business's own wallet.
- **Real email:** codes and links are queued in the same transaction as the change they announce, delivered through Resend after commit, retried on failure, and erased from the database once sent.
- **Proven receiving wallets:** a business can only add a wallet it signs for, so a mistyped address can't receive customers' payments.
- **Abuse limits:** sign-in codes are limited per address and per network.
- **Security headers:** no framing (clickjacking), HSTS, nosniff, strict referrer policy.
- **Health check:** `GET /api/health` reports database status, the function and database regions, and a warm query time. A large `dbMs` means they're in different regions.

Before launching on mainnet: give preview deployments their own database (a Neon branch), not production's; verify the email domain in Resend; set the Vercel function region to the Neon region; add Terms and Privacy pages reviewed by someone qualified; and run the full flow with a small real USDC amount.
