-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ADMIN', 'CLINIC', 'DOCTOR', 'PATIENT');
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MODERATOR');
CREATE TYPE "EntityStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED', 'DISABLED');
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW', 'REJECTED');
CREATE TYPE "AttendanceStatus" AS ENUM ('PENDING', 'ATTENDED', 'ABSENT', 'LATE');
CREATE TYPE "DayOfWeek" AS ENUM ('SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY');
CREATE TYPE "SenderType" AS ENUM ('DOCTOR', 'PATIENT');
CREATE TYPE "NotificationTargetType" AS ENUM ('ADMIN', 'CLINIC', 'DOCTOR', 'PATIENT', 'ALL');
CREATE TYPE "NotificationType" AS ENUM ('APPOINTMENT', 'SYSTEM', 'REMINDER', 'CHAT', 'COMPLAINT', 'BOOKING');
CREATE TYPE "ComplaintStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE "ComplaintUserType" AS ENUM ('PATIENT', 'DOCTOR', 'CLINIC');

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "token" VARCHAR(512) NOT NULL,
    "userType" "UserType" NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "login_attempts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ipAddress" VARCHAR(45),
    "success" BOOLEAN NOT NULL DEFAULT false,
    "userType" "UserType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "clinics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "clinics_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "doctors" (
    "id" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "clinicInfo" TEXT,
    "description" TEXT,
    "image" TEXT,
    "certificate" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "status" "EntityStatus" NOT NULL DEFAULT 'PENDING',
    "disableReason" TEXT,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastActive" TIMESTAMP(3),
    "clinic_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "attendancePoints" INTEGER NOT NULL DEFAULT 100,
    "bookingBlockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "patient_id" TEXT,
    "date" DATE NOT NULL,
    "time" VARCHAR(5) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "patient_name" TEXT,
    "patient_phone" TEXT,
    "attendance_status" "AttendanceStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "doctor_schedules" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    CONSTRAINT "doctor_schedules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "doctor_availability_slots" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "time" VARCHAR(5) NOT NULL,
    "is_booked" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "doctor_availability_slots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "sender_type" "SenderType" NOT NULL,
    "message" TEXT NOT NULL,
    "file_url" TEXT,
    "read_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "doctor_chat_settings" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "replies_enabled" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "doctor_chat_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "target_type" "NotificationTargetType" NOT NULL,
    "target_id" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "complaints" (
    "id" TEXT NOT NULL,
    "user_type" "ComplaintUserType" NOT NULL,
    "user_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "admin_name" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "site_content" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "site_content_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ratings" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- Indexes & Constraints
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");
CREATE INDEX "sessions_userId_userType_idx" ON "sessions"("userId", "userType");
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");
CREATE INDEX "login_attempts_email_idx" ON "login_attempts"("email");
CREATE INDEX "login_attempts_createdAt_idx" ON "login_attempts"("createdAt");
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");
CREATE INDEX "admins_email_idx" ON "admins"("email");
CREATE INDEX "admins_role_idx" ON "admins"("role");
CREATE UNIQUE INDEX "clinics_email_key" ON "clinics"("email");
CREATE INDEX "clinics_email_idx" ON "clinics"("email");
CREATE INDEX "clinics_status_idx" ON "clinics"("status");
CREATE UNIQUE INDEX "doctors_serialNumber_key" ON "doctors"("serialNumber");
CREATE UNIQUE INDEX "doctors_email_key" ON "doctors"("email");
CREATE INDEX "doctors_email_idx" ON "doctors"("email");
CREATE INDEX "doctors_status_idx" ON "doctors"("status");
CREATE INDEX "doctors_clinic_id_idx" ON "doctors"("clinic_id");
CREATE INDEX "doctors_city_idx" ON "doctors"("city");
CREATE INDEX "doctors_specialization_idx" ON "doctors"("specialization");
CREATE INDEX "doctors_serialNumber_idx" ON "doctors"("serialNumber");
CREATE UNIQUE INDEX "patients_email_key" ON "patients"("email");
CREATE INDEX "patients_email_idx" ON "patients"("email");
CREATE INDEX "patients_status_idx" ON "patients"("status");
CREATE INDEX "patients_phone_idx" ON "patients"("phone");
CREATE INDEX "appointments_doctor_id_idx" ON "appointments"("doctor_id");
CREATE INDEX "appointments_patient_id_idx" ON "appointments"("patient_id");
CREATE INDEX "appointments_date_idx" ON "appointments"("date");
CREATE INDEX "appointments_status_idx" ON "appointments"("status");
CREATE INDEX "appointments_doctor_id_date_idx" ON "appointments"("doctor_id", "date");
CREATE UNIQUE INDEX "doctor_schedules_doctor_id_day_of_week_key" ON "doctor_schedules"("doctor_id", "day_of_week");
CREATE INDEX "doctor_schedules_doctor_id_idx" ON "doctor_schedules"("doctor_id");
CREATE UNIQUE INDEX "doctor_availability_slots_doctor_id_date_time_key" ON "doctor_availability_slots"("doctor_id", "date", "time");
CREATE INDEX "doctor_availability_slots_doctor_id_idx" ON "doctor_availability_slots"("doctor_id");
CREATE INDEX "doctor_availability_slots_date_idx" ON "doctor_availability_slots"("date");
CREATE INDEX "doctor_availability_slots_doctor_id_date_idx" ON "doctor_availability_slots"("doctor_id", "date");
CREATE INDEX "doctor_availability_slots_is_booked_idx" ON "doctor_availability_slots"("is_booked");
CREATE INDEX "chat_messages_doctor_id_patient_id_idx" ON "chat_messages"("doctor_id", "patient_id");
CREATE INDEX "chat_messages_patient_id_idx" ON "chat_messages"("patient_id");
CREATE INDEX "chat_messages_createdAt_idx" ON "chat_messages"("createdAt");
CREATE UNIQUE INDEX "doctor_chat_settings_doctor_id_key" ON "doctor_chat_settings"("doctor_id");
CREATE INDEX "notifications_target_type_target_id_idx" ON "notifications"("target_type", "target_id");
CREATE INDEX "notifications_read_idx" ON "notifications"("read");
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");
CREATE INDEX "complaints_user_type_user_id_idx" ON "complaints"("user_type", "user_id");
CREATE INDEX "complaints_status_idx" ON "complaints"("status");
CREATE INDEX "complaints_createdAt_idx" ON "complaints"("createdAt");
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");
CREATE INDEX "activity_logs_admin_name_idx" ON "activity_logs"("admin_name");
CREATE UNIQUE INDEX "site_content_key_key" ON "site_content"("key");
CREATE UNIQUE INDEX "ratings_doctor_id_patient_id_key" ON "ratings"("doctor_id", "patient_id");
CREATE INDEX "ratings_doctor_id_idx" ON "ratings"("doctor_id");
CREATE INDEX "ratings_patient_id_idx" ON "ratings"("patient_id");
CREATE INDEX "ratings_rating_idx" ON "ratings"("rating");

-- Foreign Keys
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "doctor_schedules" ADD CONSTRAINT "doctor_schedules_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "doctor_availability_slots" ADD CONSTRAINT "doctor_availability_slots_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "doctor_chat_settings" ADD CONSTRAINT "doctor_chat_settings_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
