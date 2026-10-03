ALTER TABLE "rule_templates" ADD COLUMN IF NOT EXISTS "enabled" boolean DEFAULT true NOT NULL;

ALTER TABLE "games" ADD COLUMN IF NOT EXISTS "expires_never" boolean DEFAULT false NOT NULL;

ALTER TABLE "youtube_videos" ADD COLUMN IF NOT EXISTS "is_hidden" boolean DEFAULT false NOT NULL;
ALTER TABLE "youtube_videos" ADD COLUMN IF NOT EXISTS "sort_order" integer;

CREATE TABLE IF NOT EXISTS "admin_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_user_id" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "admin_audit_log" ADD CONSTRAINT "admin_audit_log_admin_user_id_user_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
