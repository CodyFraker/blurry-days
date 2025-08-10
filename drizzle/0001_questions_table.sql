CREATE TABLE IF NOT EXISTS "questions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "sheet_id" text NOT NULL,
  "text" text NOT NULL,
  "category" text NOT NULL,
  "weight" double precision NOT NULL,
  "base_drink" integer NOT NULL,
  "order" integer NOT NULL,
  "last_synced" timestamp NOT NULL DEFAULT now(),
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "category_check" CHECK ("category" IN ('camera', 'film', 'technique', 'location', 'equipment', 'general'))
);