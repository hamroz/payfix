-- Existing members start caught up: history before this release counts as read.
UPDATE "memberships" SET "notifications_read_at" = now() WHERE "notifications_read_at" IS NULL;
