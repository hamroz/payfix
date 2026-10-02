CREATE TABLE "memberships" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "businesses" DROP CONSTRAINT "businesses_owner_email_unique";--> statement-breakpoint
ALTER TABLE "business_wallets" ADD COLUMN "secret_enc" text;--> statement-breakpoint
ALTER TABLE "outbox" ADD COLUMN "business_id" text;--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN "business_note" text;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "memberships_business_user" ON "memberships" USING btree ("business_id","user_id");--> statement-breakpoint
INSERT INTO "users" ("id", "email") SELECT DISTINCT ON ("owner_email") 'usr_' || md5("owner_email"), "owner_email" FROM "businesses" ON CONFLICT DO NOTHING;--> statement-breakpoint
INSERT INTO "memberships" ("id", "business_id", "user_id", "role")
SELECT 'mem_' || md5(b."id"), b."id", u."id", 'owner' FROM "businesses" b JOIN "users" u ON u."email" = b."owner_email" ON CONFLICT DO NOTHING;--> statement-breakpoint
DELETE FROM "sessions" WHERE "kind" = 'business';
