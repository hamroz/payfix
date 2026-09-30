import path from "node:path";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
  claimDataDir(dir);
  try {
    return await openPglite(dir);
  } catch (err) {
    if (String(err).includes("Aborted") || String((err as { cause?: unknown }).cause).includes("Aborted"))
      throw new Error(
        `The embedded database in ${PGLITE_DIR} is corrupted — usually from two processes using it at once. ` +
          `Move it aside (mv ${PGLITE_DIR} ${PGLITE_DIR}.bak) and restart, or run with Docker: docker compose up -d`,
        { cause: err },
      );
    throw err;
  }
}

/**
 * PGlite is single-process: two servers on one data directory corrupt it. Refuse to
 * open a directory another live process has claimed.
 */
function claimDataDir(dir: string) {
  const lock = path.join(dir, "payfix.pid");
  let owner = 0;
  try {
    owner = Number(readFileSync(lock, "utf8")) || 0;
  } catch {
    // no lock yet
  }
  if (owner && owner !== process.pid && isAlive(owner)) {
    throw new Error(
      `Another PayFix process (pid ${owner}) is already using ${dir}. The embedded database allows one process at a time — ` +
        `stop the other server, or run with Docker/Postgres (docker compose up -d).`,
    );
  }
  writeFileSync(lock, String(process.pid));
}

function isAlive(pid: number) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return (err as NodeJS.ErrnoException).code === "EPERM";
  }
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
