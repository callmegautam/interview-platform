CREATE TYPE "public"."candidate_status" AS ENUM('pending', 'in_progress', 'completed', 'passed', 'failed');
CREATE TYPE "public"."flag_type" AS ENUM('tab_switch', 'app_switch');
CREATE TYPE "public"."interview_status" AS ENUM('draft', 'active', 'closed');
CREATE TYPE "public"."question_type" AS ENUM('code', 'text');
CREATE TYPE "public"."recording_type" AS ENUM('screen', 'webcam');

CREATE TABLE "companies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "password_hash" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "companies_email_unique" UNIQUE("email")
);

CREATE TABLE "questions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "type" "question_type" NOT NULL,
  "language" text,
  "code_starter" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "interviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "time_limit_minutes" integer NOT NULL,
  "status" "interview_status" DEFAULT 'draft' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "interview_questions" (
  "interview_id" uuid NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  "question_id" uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  "order" integer NOT NULL
);

CREATE TABLE "candidates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "interview_id" uuid NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text,
  "token" text NOT NULL UNIQUE,
  "status" "candidate_status" DEFAULT 'pending' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "started_at" timestamp,
  "completed_at" timestamp
);

CREATE TABLE "answers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "candidate_id" uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  "question_id" uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  "answer_text" text,
  "code" text,
  "language" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "recordings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "candidate_id" uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  "type" "recording_type" NOT NULL,
  "storage_path" text NOT NULL,
  "file_size" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "expires_at" timestamp NOT NULL
);

CREATE TABLE "flags" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "candidate_id" uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  "type" "flag_type" NOT NULL,
  "details" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "scores" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  "candidate_id" uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  "question_id" uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  "score" integer NOT NULL,
  "feedback" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);
