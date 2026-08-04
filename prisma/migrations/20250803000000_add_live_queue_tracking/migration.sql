-- Add live queue tracking
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "queue_number" INTEGER;

CREATE INDEX IF NOT EXISTS "appointments_doctor_id_date_queue_number_idx"
  ON "appointments"("doctor_id", "date", "queue_number");

CREATE TABLE IF NOT EXISTS "doctor_queue_sessions" (
  "id" TEXT NOT NULL,
  "doctor_id" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "current_number" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT false,
  "is_completed" BOOLEAN NOT NULL DEFAULT false,
  "started_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "doctor_queue_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "doctor_queue_sessions_doctor_id_date_key"
  ON "doctor_queue_sessions"("doctor_id", "date");

CREATE INDEX IF NOT EXISTS "doctor_queue_sessions_doctor_id_date_idx"
  ON "doctor_queue_sessions"("doctor_id", "date");

ALTER TABLE "doctor_queue_sessions"
  ADD CONSTRAINT "doctor_queue_sessions_doctor_id_fkey"
  FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
