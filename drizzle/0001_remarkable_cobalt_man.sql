ALTER TABLE "messages" ALTER COLUMN "timestamp" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "threads" ALTER COLUMN "timestamp" SET DEFAULT now();