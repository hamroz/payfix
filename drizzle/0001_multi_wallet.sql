CREATE TABLE "business_wallets" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"address" text NOT NULL,
	"label" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "refunds" ADD COLUMN "source_wallet" text;--> statement-breakpoint
ALTER TABLE "transfers" ADD COLUMN "wallet_address" text;--> statement-breakpoint
ALTER TABLE "business_wallets" ADD CONSTRAINT "business_wallets_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "business_wallets_business_address" ON "business_wallets" USING btree ("business_id","address");--> statement-breakpoint
INSERT INTO "business_wallets" ("id", "business_id", "address", "label")
SELECT 'bw_' || "id", "id", "wallet_address", 'Primary wallet' FROM "businesses"
ON CONFLICT DO NOTHING;--> statement-breakpoint
UPDATE "transfers" t SET "wallet_address" = b."wallet_address" FROM "businesses" b WHERE t."business_id" = b."id" AND t."wallet_address" IS NULL;--> statement-breakpoint
UPDATE "refunds" r SET "source_wallet" = b."wallet_address" FROM "businesses" b WHERE r."business_id" = b."id" AND r."source_wallet" IS NULL;
