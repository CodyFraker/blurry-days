DROP TABLE IF EXISTS "questions";

CREATE TABLE IF NOT EXISTS "rule_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" text NOT NULL,
	"category" text NOT NULL,
	"weight" double precision NOT NULL,
	"base_drink" integer NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rule_templates_category_check" CHECK ("category" IN ('camera', 'film', 'technique', 'location', 'equipment', 'general'))
);

CREATE INDEX IF NOT EXISTS "rule_templates_created_at_idx" ON "rule_templates" ("created_at");

ALTER TABLE "rules" ADD COLUMN IF NOT EXISTS "rule_template_id" uuid;

DO $$ BEGIN
 ALTER TABLE "rules" ADD CONSTRAINT "rules_rule_template_id_rule_templates_id_fk" FOREIGN KEY ("rule_template_id") REFERENCES "public"."rule_templates"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "rule_votes" (
	"user_id" text NOT NULL,
	"rule_template_id" uuid NOT NULL,
	"vote" smallint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rule_votes_user_id_rule_template_id_pk" PRIMARY KEY("user_id","rule_template_id"),
	CONSTRAINT "rule_votes_vote_check" CHECK ("vote" IN (-1, 1))
);

DO $$ BEGIN
 ALTER TABLE "rule_votes" ADD CONSTRAINT "rule_votes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "rule_votes" ADD CONSTRAINT "rule_votes_rule_template_id_rule_templates_id_fk" FOREIGN KEY ("rule_template_id") REFERENCES "public"."rule_templates"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

INSERT INTO "rule_templates" ("text", "category", "weight", "base_drink")
SELECT v.text, v.category, v.weight, v.base_drink
FROM (VALUES
	('Every time {host} mentions a specific camera model', 'camera', 0.8::double precision, 0),
	('When {host} shows the camera''s viewfinder', 'camera', 0.6::double precision, 0),
	('If {host} adjusts camera settings on screen', 'camera', 0.7::double precision, 1),
	('Every time {host} mentions film stock', 'film', 0.9::double precision, 0),
	('When {host} shows film being loaded', 'film', 0.5::double precision, 1),
	('If {host} discusses film development', 'film', 0.6::double precision, 2),
	('When {host} explains a photography technique', 'technique', 0.7::double precision, 0),
	('If {host} demonstrates manual focus', 'technique', 0.5::double precision, 1),
	('When {host} talks about composition', 'technique', 0.6::double precision, 0),
	('Every time {host} mentions a location', 'location', 0.8::double precision, 0),
	('When {host} shows outdoor shooting', 'location', 0.6::double precision, 1),
	('When {host} mentions any photography equipment', 'equipment', 0.7::double precision, 0),
	('If {host} shows a tripod', 'equipment', 0.4::double precision, 1),
	('Every time {host} says ''film photography''', 'general', 0.9::double precision, 0),
	('When {host} shows the final photo', 'general', 0.8::double precision, 2),
	('If {host} mentions the cost of anything', 'general', 0.6::double precision, 1)
) AS v(text, category, weight, base_drink)
WHERE NOT EXISTS (SELECT 1 FROM "rule_templates" LIMIT 1);
