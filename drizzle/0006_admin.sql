CREATE TABLE "admin_audit" (
	"id" text PRIMARY KEY NOT NULL,
	"admin_email" text NOT NULL,
	"action" text NOT NULL,
	"target_type" text,
	"target_id" text,
	"reason" text,
	"data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blocks" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"target" text NOT NULL,
	"reason" text NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"lifted_at" timestamp with time zone,
	"lifted_by" text
);
--> statement-breakpoint
CREATE TABLE "feedback_responses" (
	"id" text PRIMARY KEY NOT NULL,
	"cohort" text,
	"locale" text NOT NULL,
	"completed" text NOT NULL,
	"minutes" integer,
	"ease" integer NOT NULL,
	"nps" integer NOT NULL,
	"answers" jsonb NOT NULL,
	"about" text,
	"device" text,
	"quote_ok" boolean DEFAULT false NOT NULL,
	"user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "suspended_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "suspended_reason" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "sample" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "suspended_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "suspended_reason" text;--> statement-breakpoint
ALTER TABLE "feedback_responses" ADD CONSTRAINT "feedback_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_audit_created" ON "admin_audit" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "admin_audit_target" ON "admin_audit" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE UNIQUE INDEX "blocks_one_active" ON "blocks" USING btree ("kind","target") WHERE lifted_at is null;--> statement-breakpoint
CREATE INDEX "feedback_created" ON "feedback_responses" USING btree ("created_at");