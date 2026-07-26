CREATE TYPE "public"."budget" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'non_binary', 'prefer_not_to_say');--> statement-breakpoint
CREATE TYPE "public"."goal" AS ENUM('fat_loss', 'muscle_gain', 'body_recomposition', 'general_health', 'confidence');--> statement-breakpoint
CREATE TYPE "public"."gym_experience" AS ENUM('none', 'beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."physique" AS ENUM('skinny', 'average', 'overweight', 'athletic', 'muscular');--> statement-breakpoint
CREATE TABLE "daily_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"workout_title" text NOT NULL,
	"workout_description" text NOT NULL,
	"nutrition_title" text NOT NULL,
	"nutrition_description" text NOT NULL,
	"skincare_title" text NOT NULL,
	"skincare_description" text NOT NULL,
	"grooming_title" text NOT NULL,
	"grooming_description" text NOT NULL,
	"confidence_title" text NOT NULL,
	"confidence_description" text NOT NULL,
	"habit_title" text NOT NULL,
	"habit_description" text NOT NULL,
	"motivation_title" text NOT NULL,
	"motivation_description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "daily_plans_user_id_date_unique" UNIQUE("user_id","date")
);
--> statement-breakpoint
CREATE TABLE "habit_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"habit_id" uuid NOT NULL,
	"date" date NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	CONSTRAINT "habit_entries_habit_id_date_unique" UNIQUE("habit_id","date")
);
--> statement-breakpoint
CREATE TABLE "habits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mission_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"category" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	CONSTRAINT "mission_completions_user_id_date_category_unique" UNIQUE("user_id","date","category")
);
--> statement-breakpoint
CREATE TABLE "onboarding_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"age" integer NOT NULL,
	"gender" "gender" NOT NULL,
	"height_cm" real NOT NULL,
	"weight_kg" real NOT NULL,
	"goal" "goal" NOT NULL,
	"current_physique" "physique" NOT NULL,
	"skin_concerns" text[] NOT NULL,
	"hair_concerns" text[] NOT NULL,
	"budget" "budget" NOT NULL,
	"confidence" integer NOT NULL,
	"sleep_hours" real NOT NULL,
	"gym_experience" "gym_experience" NOT NULL,
	"current_habits" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "progress_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"weight_kg" real,
	"waist_cm" real,
	"chest_cm" real,
	"arms_cm" real,
	"before_photo_url" text,
	"after_photo_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "streak_state" (
	"user_id" text PRIMARY KEY NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"last_active_date" date
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_plans" ADD CONSTRAINT "daily_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_entries" ADD CONSTRAINT "habit_entries_habit_id_habits_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."habits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habits" ADD CONSTRAINT "habits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_completions" ADD CONSTRAINT "mission_completions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_profiles" ADD CONSTRAINT "onboarding_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_entries" ADD CONSTRAINT "progress_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streak_state" ADD CONSTRAINT "streak_state_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;