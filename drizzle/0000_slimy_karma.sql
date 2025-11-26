CREATE TYPE "public"."dustbin_status" AS ENUM('active', 'full', 'damaged', 'removed');--> statement-breakpoint
CREATE TABLE "dustbins" (
	"id" serial PRIMARY KEY NOT NULL,
	"latitude" numeric(10, 8) NOT NULL,
	"longitude" numeric(11, 8) NOT NULL,
	"address" text,
	"description" text,
	"status" "dustbin_status" DEFAULT 'active' NOT NULL,
	"reported_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
