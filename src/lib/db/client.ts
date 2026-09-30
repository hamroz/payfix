import path from "node:path";
import { mkdirSync } from "node:fs";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

export type Db = NodePgDatabase<typeof schema>;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
/** Anything that can run queries: the db itself or an open transaction. */
export type Executor = Db | Tx;

const MIGRATIONS = path.join(process.cwd(), "drizzle"); // shipped via outputFileTracingIncludes

type Holder = { db?: Promise<Db> };
const holder = globalThis as typeof globalThis & { __payfixDb?: Holder };
holder.__payfixDb ??= {};

/**
 * Returns the shared database, migrating it on first use.
 * With DATABASE_URL set it uses node-postgres; otherwise an embedded PGlite database
 * on disk, so local development needs no Postgres install.
 */
export function getDb(): Promise<Db> {
  holder.__payfixDb!.db ??= open().catch((err) => {
    holder.__payfixDb!.db = undefined;
    throw err;
  });
  return holder.__payfixDb!.db;
}

async function open(): Promise<Db> {
  const { DATABASE_URL, PGLITE_DIR } = env();
  if (DATABASE_URL) {
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    const db = drizzle(new Pool({ connectionString: DATABASE_URL, max: 5 }), { schema });
    await migrate(db, { migrationsFolder: MIGRATIONS });
    return db;
  }
  const dir = path.resolve(/*turbopackIgnore: true*/ process.cwd(), PGLITE_DIR);
  mkdirSync(dir, { recursive: true });
  return openPglite(dir);
}

/** Opens PGlite at `dataDir` (or in memory when omitted) and applies migrations. Used by tests too. */
export async function openPglite(dataDir?: string): Promise<Db> {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const client = new PGlite(dataDir);
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: MIGRATIONS });
  return db as unknown as Db;
}
