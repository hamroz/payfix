@AGENTS.md

# PayFix — working notes for agents

Read README.md first. It explains the product, the demo scenario, and where each reliability gate lives.

## Commands

- `npm run dev`: app on :3000. With no `.env.local` mint it runs on the simulated chain with PGlite in `.data/`.
- `npm test`: vitest, including `src/lib/server/flow.test.ts`, the whole demo scenario offline. Run it after any change to `src/lib/{domain,server,solana}`.
- `npm run typecheck`, `npm run lint`, `npm run build`.
- Schema change: edit `src/lib/db/schema.ts`, then `npm run db:generate`. Migrations apply on first DB use.

## Invariants — do not break these

- Money is `bigint` base units everywhere. Stored proposal lines hold base-unit integer strings; decimal strings exist only at the UI/action boundary (`parseLines`). Never use floats for money except cosmetic animation.
- Every ledger write goes through `postEntry` with a unique idempotency key, and every entry sums to zero. `received = invoice + credit + refund_pending + refunded + unresolved` must always hold.
- Ingesting a signature twice must be a no-op (`chain_signatures` claim inside the same DB transaction).
- Proposals are immutable versions. Any change creates a new version and invalidates earlier approvals. Execution re-verifies the hash and balances.
- Refunds: prepare exact tx → wallet signs → verify bytes match → record signature → broadcast. At most one prepared/submitted attempt per refund; retry only after blockhash expiry.
- Customer actions must re-check that the session customer equals the resolution link's customer (`authorizedCase`). Business actions must check `businessId` ownership.
- Test money must stay labeled (NetworkPill). Demo features are gated on `env().DEMO_MODE`, which refuses mainnet.

## Conventions

- Server-only code lives in `src/lib/server` (guarded by `server-only` where it touches secrets or cookies). `src/lib/solana` and `src/lib/domain` stay isomorphic and secret-free.
- Services take `{ db, chain }` so tests can pass PGlite in-memory plus `SimChain`.
- Server actions return `ActionResult` via `run()`. Throw `ResolutionError`/`InputError` for user-facing messages.
- Next.js 16: `params`/`cookies()` are async. Use `refresh()` from `next/cache` after mutations. Pages may only export Next's allowed fields.
- UI: dark glass aesthetic, tokens in `src/app/globals.css`, primitives in `src/components/ui`, motion via `motion/react`. Keep amounts `tabular`.
