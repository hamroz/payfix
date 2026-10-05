CREATE TABLE "notification_reads" (
	"user_id" text NOT NULL,
	"event_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notification_reads_user_id_event_id_pk" PRIMARY KEY("user_id","event_id")
);
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "actor_user_id" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "dedupe_key" text;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "notification_muted" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "notifications_read_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notification_reads" ADD CONSTRAINT "notification_reads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_reads" ADD CONSTRAINT "notification_reads_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "events_business_dedupe" ON "events" USING btree ("business_id","dedupe_key");