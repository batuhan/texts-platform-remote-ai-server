DO $$ BEGIN
 CREATE TYPE "message_behavior" AS ENUM('silent', 'keep_read', 'dont_notify');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "mood" AS ENUM('sad', 'ok', 'happy');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "type" AS ENUM('single', 'group', 'channel', 'broadcast');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
	"id" varchar PRIMARY KEY NOT NULL,
	"timestamp" timestamp,
	"edited_timestamp" timestamp,
	"expires_in_seconds" integer,
	"sender_id" varchar,
	"text" varchar,
	"seen" boolean,
	"is_delivered" boolean,
	"is_hidden" boolean,
	"is_sender" boolean,
	"is_action" boolean,
	"is_deleted" boolean,
	"is_errored" boolean,
	"behavior" "message_behavior",
	"account_id" varchar,
	"thread_id" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "participants" (
	"thread_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	CONSTRAINT "participants_thread_id_user_id_pk" PRIMARY KEY("thread_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "table" (
	"mood" "mood"
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "threads" (
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"is_unread" boolean DEFAULT false,
	"last_read_message_id" varchar,
	"is_read_only" boolean DEFAULT false,
	"is_archived" boolean,
	"is_pinned" boolean,
	"type" "type" DEFAULT 'single',
	"timestamp" timestamp,
	"img_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"description" text,
	"message_expiry_seconds" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"username" varchar,
	"phone_number" varchar,
	"email" varchar,
	"full_name" varchar,
	"nickname" varchar,
	"img_url" varchar,
	"is_verified" boolean,
	"cannot_message" boolean,
	"is_self" boolean
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "participants" ADD CONSTRAINT "participants_thread_id_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "threads"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "participants" ADD CONSTRAINT "participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
