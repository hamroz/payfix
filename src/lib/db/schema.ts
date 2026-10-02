import { sql } from "drizzle-orm";
import {
  bigint,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  index,
  boolean,
} from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const ts = (name: string) => timestamp(name, { withTimezone: true });
const units = (name: string) => bigint(name, { mode: "bigint" });

// ── Parties ────────────────────────────────────────────────────────────────

export const businesses = pgTable("businesses", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  /** Email of whoever created the company. Access is governed by `memberships`, not this. */
  ownerEmail: text("owner_email").notNull(),
  walletAddress: text("wallet_address").notNull(),
  mint: text("mint").notNull(),
  createdAt: createdAt(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: createdAt(),
});

export type Role = "owner" | "editor" | "viewer";

/** A user's access to one company. Owners manage team, wallets, and the workspace; editors run operations; viewers read. */
export const memberships = pgTable(
  "memberships",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id").notNull().references(() => businesses.id),
    userId: text("user_id").notNull().references(() => users.id),
    role: text("role").$type<Role>().notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("memberships_business_user").on(t.businessId, t.userId)],
);

/**
 * Every wallet a business has received into. `businesses.walletAddress` is the active one
 * (new payment links point there); all of them stay watched so older links still settle.
 */
export const businessWallets = pgTable(
  "business_wallets",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id").notNull().references(() => businesses.id),
    address: text("address").notNull(),
    label: text("label").notNull(),
    /** Demo mode only: the wallet's secret key, encrypted with a key derived from SESSION_SECRET. */
    secretEnc: text("secret_enc"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("business_wallets_business_address").on(t.businessId, t.address)],
);

export const customers = pgTable(
  "customers",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id").notNull().references(() => businesses.id),
    name: text("name").notNull(),
    email: text("email").notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("customers_business_email").on(t.businessId, t.email)],
);

// ── Invoices and payment requests ──────────────────────────────────────────

export const invoices = pgTable(
  "invoices",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id").notNull().references(() => businesses.id),
    customerId: text("customer_id").notNull().references(() => customers.id),
    number: text("number").notNull(),
    title: text("title").notNull(),
    amount: units("amount").notNull(),
    dueAt: ts("due_at").notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("invoices_business_number").on(t.businessId, t.number)],
);

/** One Solana Pay reference key per payment attempt; a transfer carrying it is matched to the invoice. */
export const paymentRequests = pgTable("payment_requests", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull().references(() => businesses.id),
  invoiceId: text("invoice_id").notNull().references(() => invoices.id),
  reference: text("reference").notNull().unique(),
  amount: units("amount"),
  createdAt: createdAt(),
});

// ── Chain observations ─────────────────────────────────────────────────────

/** Every signature seen on the merchant token account, relevant or not, so it is fetched once. */
export const chainSignatures = pgTable(
  "chain_signatures",
  {
    businessId: text("business_id").notNull().references(() => businesses.id),
    signature: text("signature").notNull(),
    relevant: boolean("relevant").notNull(),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.businessId, t.signature] })],
);

export type TransferFlag = "late";

/** A verified token movement into or out of the merchant's token account. Unique per signature. */
export const transfers = pgTable(
  "transfers",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id").notNull().references(() => businesses.id),
    signature: text("signature").notNull(),
    direction: text("direction", { enum: ["in", "out"] }).notNull(),
    mint: text("mint").notNull(),
    /** The business wallet whose token account moved. Null only for rows from before multi-wallet support. */
    walletAddress: text("wallet_address"),
    amount: units("amount").notNull(),
    counterpartyOwner: text("counterparty_owner"),
    counterpartyTokenAccount: text("counterparty_token_account"),
    reference: text("reference"),
    invoiceId: text("invoice_id").references(() => invoices.id),
    customerId: text("customer_id").references(() => customers.id),
    flags: jsonb("flags").$type<TransferFlag[]>().notNull().default([]),
    slot: bigint("slot", { mode: "number" }).notNull(),
    blockTime: ts("block_time"),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("transfers_business_signature").on(t.businessId, t.signature),
    index("transfers_invoice").on(t.invoiceId),
  ],
);

// ── Exceptions and resolution ──────────────────────────────────────────────

export type CaseKind = "overpayment" | "duplicate" | "unmatched";
export type CaseStatus = "open" | "proposed" | "approved" | "executing" | "resolved";

export const cases = pgTable("cases", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull().references(() => businesses.id),
  customerId: text("customer_id").references(() => customers.id),
  invoiceId: text("invoice_id").references(() => invoices.id),
  kind: text("kind").$type<CaseKind>().notNull(),
  status: text("status").$type<CaseStatus>().notNull().default("open"),
  createdAt: createdAt(),
  resolvedAt: ts("resolved_at"),
});

export const caseTransfers = pgTable(
  "case_transfers",
  {
    caseId: text("case_id").notNull().references(() => cases.id),
    transferId: text("transfer_id").notNull().references(() => transfers.id),
  },
  (t) => [primaryKey({ columns: [t.caseId, t.transferId] })],
);

export const resolutionLinks = pgTable("resolution_links", {
  id: text("id").primaryKey(),
  caseId: text("case_id").notNull().references(() => cases.id),
  customerId: text("customer_id").notNull().references(() => customers.id),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: ts("expires_at").notNull(),
  revokedAt: ts("revoked_at"),
  createdAt: createdAt(),
});

/** Amounts are base-unit integer strings once stored; decimal strings only at the input boundary. */
export type ProposalLine =
  | { type: "invoice"; invoiceId: string; amount: string }
  | { type: "credit"; amount: string }
  | { type: "refund"; amount: string };

export type DestinationProof = {
  method: "wallet_signature" | "demo_wallet";
  message: string;
  signature: string;
  verifiedAt: string;
};

export type ProposalStatus = "submitted" | "approved" | "superseded" | "declined" | "executed";

export const proposals = pgTable(
  "proposals",
  {
    id: text("id").primaryKey(),
    caseId: text("case_id").notNull().references(() => cases.id),
    version: integer("version").notNull(),
    authorKind: text("author_kind", { enum: ["customer", "business"] }).notNull(),
    authorId: text("author_id").notNull(),
    lines: jsonb("lines").$type<ProposalLine[]>().notNull(),
    refundDestination: text("refund_destination"),
    destinationProof: jsonb("destination_proof").$type<DestinationProof>(),
    available: units("available").notNull(),
    hash: text("hash").notNull(),
    status: text("status").$type<ProposalStatus>().notNull().default("submitted"),
    note: text("note"),
    /** Set when the business declines this version and asks the customer for changes. */
    businessNote: text("business_note"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("proposals_case_version").on(t.caseId, t.version)],
);

/** Approval of one exact proposal version. Valid only while that version is current and unexecuted. */
export const approvals = pgTable("approvals", {
  id: text("id").primaryKey(),
  proposalId: text("proposal_id").notNull().references(() => proposals.id),
  proposalHash: text("proposal_hash").notNull(),
  approvedBy: text("approved_by").notNull(),
  createdAt: createdAt(),
  invalidatedAt: ts("invalidated_at"),
  invalidatedReason: text("invalidated_reason"),
});

// ── Refunds ────────────────────────────────────────────────────────────────

export type RefundStatus = "awaiting_signature" | "submitted" | "confirmed" | "failed";
export type RefundAttemptStatus = "prepared" | "submitted" | "confirmed" | "expired" | "failed";

export const refunds = pgTable(
  "refunds",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id").notNull().references(() => businesses.id),
    caseId: text("case_id").notNull().references(() => cases.id),
    proposalId: text("proposal_id").notNull().references(() => proposals.id),
    amount: units("amount").notNull(),
    /** The business wallet that holds the funds and must sign the refund. */
    sourceWallet: text("source_wallet"),
    destinationOwner: text("destination_owner").notNull(),
    destinationTokenAccount: text("destination_token_account").notNull(),
    status: text("status").$type<RefundStatus>().notNull().default("awaiting_signature"),
    signature: text("signature"),
    createdAt: createdAt(),
    confirmedAt: ts("confirmed_at"),
  },
  (t) => [uniqueIndex("refunds_proposal").on(t.proposalId)],
);

/**
 * Each attempt is one exact signed transaction. At most one attempt per refund may be
 * prepared or submitted; a new one is allowed only after the previous blockhash expired
 * without landing, or the transaction failed on chain.
 */
export const refundAttempts = pgTable(
  "refund_attempts",
  {
    id: text("id").primaryKey(),
    refundId: text("refund_id").notNull().references(() => refunds.id),
    message: text("message").notNull(),
    blockhash: text("blockhash").notNull(),
    lastValidBlockHeight: bigint("last_valid_block_height", { mode: "number" }).notNull(),
    signature: text("signature"),
    status: text("status").$type<RefundAttemptStatus>().notNull().default("prepared"),
    error: text("error"),
    createdAt: createdAt(),
    updatedAt: ts("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("refund_attempts_one_active")
      .on(t.refundId)
      .where(sql`status in ('prepared', 'submitted')`),
  ],
);

// ── Ledger ─────────────────────────────────────────────────────────────────

export type Account = "external" | "unresolved" | "invoice" | "credit" | "refund_pending" | "refunded";

/** A balanced set of postings. The idempotency key makes re-processing a no-op. */
export const journalEntries = pgTable("journal_entries", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull().references(() => businesses.id),
  idempotencyKey: text("idempotency_key").notNull().unique(),
  kind: text("kind").notNull(),
  caseId: text("case_id").references(() => cases.id),
  memo: text("memo").notNull(),
  createdAt: createdAt(),
});

export const postings = pgTable(
  "postings",
  {
    id: text("id").primaryKey(),
    entryId: text("entry_id").notNull().references(() => journalEntries.id),
    businessId: text("business_id").notNull().references(() => businesses.id),
    account: text("account").$type<Account>().notNull(),
    amount: units("amount").notNull(),
    transferId: text("transfer_id").references(() => transfers.id),
    invoiceId: text("invoice_id").references(() => invoices.id),
    customerId: text("customer_id").references(() => customers.id),
    refundId: text("refund_id").references(() => refunds.id),
    caseId: text("case_id").references(() => cases.id),
  },
  (t) => [
    index("postings_business_account").on(t.businessId, t.account),
    index("postings_transfer").on(t.transferId),
    index("postings_invoice").on(t.invoiceId),
  ],
);

// ── Activity ───────────────────────────────────────────────────────────────

export const events = pgTable(
  "events",
  {
    id: text("id").primaryKey(),
    businessId: text("business_id").notNull().references(() => businesses.id),
    caseId: text("case_id").references(() => cases.id),
    invoiceId: text("invoice_id").references(() => invoices.id),
    customerId: text("customer_id").references(() => customers.id),
    actor: text("actor", { enum: ["system", "business", "customer"] }).notNull(),
    type: text("type").notNull(),
    message: text("message").notNull(),
    data: jsonb("data").$type<Record<string, unknown>>(),
    createdAt: createdAt(),
  },
  (t) => [index("events_business_created").on(t.businessId, t.createdAt)],
);

// ── Auth ───────────────────────────────────────────────────────────────────

export const otpCodes = pgTable("otp_codes", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  purpose: text("purpose", { enum: ["business", "customer"] }).notNull(),
  subjectId: text("subject_id").notNull(),
  codeHash: text("code_hash").notNull(),
  attempts: integer("attempts").notNull().default(0),
  expiresAt: ts("expires_at").notNull(),
  consumedAt: ts("consumed_at"),
  createdAt: createdAt(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  kind: text("kind", { enum: ["business", "customer"] }).notNull(),
  subjectId: text("subject_id").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: ts("expires_at").notNull(),
  createdAt: createdAt(),
});

/** Demo-mode mailbox: every email PayFix would send is stored here and shown at /dev/inbox. */
export const outbox = pgTable("outbox", {
  id: text("id").primaryKey(),
  /** The company the email is about, so the demo inbox only shows it to that company's members. */
  businessId: text("business_id"),
  to: text("to").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  link: text("link"),
  code: text("code"),
  createdAt: createdAt(),
});
