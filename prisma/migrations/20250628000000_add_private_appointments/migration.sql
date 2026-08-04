-- Private appointments: time range blocks visible only to doctors
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "end_time" VARCHAR(5);
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "is_private" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "appointments_doctor_id_is_private_date_idx"
  ON "appointments"("doctor_id", "is_private", "date");
