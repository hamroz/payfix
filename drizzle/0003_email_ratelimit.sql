CREATE TABLE "rate_events" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "outbox" ADD COLUMN "status" text DEFAULT 'demo' NOT NULL;--> statement-breakpoint
ALTER TABLE "outbox" ADD COLUMN "attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "outbox" ADD COLUMN "error" text;--> statement-breakpoint
ALTER TABLE "outbox" ADD COLUMN "sent_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "rate_events_key_time" ON "rate_events" USING btree ("key","created_at");--> statement-breakpoint
CREATE INDEX "outbox_pending" ON "outbox" USING btree ("status","created_at");