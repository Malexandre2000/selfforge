CREATE TYPE "public"."feature_request_status" AS ENUM('open', 'planned', 'shipped', 'declined');--> statement-breakpoint
CREATE TYPE "public"."feedback_status" AS ENUM('new', 'reviewed', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."feedback_type" AS ENUM('feedback', 'bug');--> statement-breakpoint
CREATE TYPE "public"."waitlist_status" AS ENUM('waiting', 'invited', 'joined');--> statement-breakpoint
CREATE TABLE "feature_request_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feature_request_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "feature_request_votes_feature_request_id_user_id_unique" UNIQUE("feature_request_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "feature_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status" "feature_request_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" "feedback_type" NOT NULL,
	"message" text NOT NULL,
	"page_url" text,
	"screenshot_url" text,
	"status" "feedback_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "waitlist_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"referral_code" text NOT NULL,
	"referred_by_code" text,
	"status" "waitlist_status" DEFAULT 'waiting' NOT NULL,
	"invite_code" text,
	"joined_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"invited_at" timestamp,
	"joined_at" timestamp,
	CONSTRAINT "waitlist_entries_email_unique" UNIQUE("email"),
	CONSTRAINT "waitlist_entries_referral_code_unique" UNIQUE("referral_code"),
	CONSTRAINT "waitlist_entries_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
ALTER TABLE "feature_request_votes" ADD CONSTRAINT "feature_request_votes_feature_request_id_feature_requests_id_fk" FOREIGN KEY ("feature_request_id") REFERENCES "public"."feature_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_request_votes" ADD CONSTRAINT "feature_request_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_requests" ADD CONSTRAINT "feature_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_entries" ADD CONSTRAINT "feedback_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_joined_user_id_users_id_fk" FOREIGN KEY ("joined_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "feedback_entries_user_id_idx" ON "feedback_entries" USING btree ("user_id");