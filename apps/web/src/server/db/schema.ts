import {
  pgTable,
  pgEnum,
  text,
  integer,
  real,
  boolean,
  date,
  timestamp,
  uuid,
  unique,
  index,
} from "drizzle-orm/pg-core";
import {
  GENDER_OPTIONS,
  GOAL_OPTIONS,
  PHYSIQUE_OPTIONS,
  BUDGET_OPTIONS,
  GYM_EXPERIENCE_OPTIONS,
} from "@selfforge/types";

/**
 * Enum values are imported directly from @selfforge/types so the Postgres
 * enums and the Zod schema that validates API input can never drift apart.
 */
export const genderEnum = pgEnum("gender", GENDER_OPTIONS);
export const goalEnum = pgEnum("goal", GOAL_OPTIONS);
export const physiqueEnum = pgEnum("physique", PHYSIQUE_OPTIONS);
export const budgetEnum = pgEnum("budget", BUDGET_OPTIONS);
export const gymExperienceEnum = pgEnum("gym_experience", GYM_EXPERIENCE_OPTIONS);

/** One row per Clerk user — Clerk is the source of truth for auth/identity. */
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user id
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const onboardingProfiles = pgTable("onboarding_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  age: integer("age").notNull(),
  gender: genderEnum("gender").notNull(),
  heightCm: real("height_cm").notNull(),
  weightKg: real("weight_kg").notNull(),
  goal: goalEnum("goal").notNull(),
  currentPhysique: physiqueEnum("current_physique").notNull(),
  skinConcerns: text("skin_concerns").array().notNull(),
  hairConcerns: text("hair_concerns").array().notNull(),
  budget: budgetEnum("budget").notNull(),
  confidence: integer("confidence").notNull(),
  sleepHours: real("sleep_hours").notNull(),
  gymExperience: gymExperienceEnum("gym_experience").notNull(),
  currentHabits: text("current_habits").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** One row per user per day — the 7 daily mission descriptions. */
export const dailyPlans = pgTable(
  "daily_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    workoutTitle: text("workout_title").notNull(),
    workoutDescription: text("workout_description").notNull(),
    nutritionTitle: text("nutrition_title").notNull(),
    nutritionDescription: text("nutrition_description").notNull(),
    skincareTitle: text("skincare_title").notNull(),
    skincareDescription: text("skincare_description").notNull(),
    groomingTitle: text("grooming_title").notNull(),
    groomingDescription: text("grooming_description").notNull(),
    confidenceTitle: text("confidence_title").notNull(),
    confidenceDescription: text("confidence_description").notNull(),
    habitTitle: text("habit_title").notNull(),
    habitDescription: text("habit_description").notNull(),
    motivationTitle: text("motivation_title").notNull(),
    motivationDescription: text("motivation_description").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.userId, t.date)],
);

/** Completion checkbox state for each of today's 7 mission categories. */
export const missionCompletions = pgTable(
  "mission_completions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    category: text("category").notNull(),
    completed: boolean("completed").notNull().default(false),
  },
  (t) => [unique().on(t.userId, t.date, t.category)],
);

export const habits = pgTable(
  "habits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("habits_user_id_idx").on(t.userId)],
);

export const habitEntries = pgTable(
  "habit_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    habitId: uuid("habit_id")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    completed: boolean("completed").notNull().default(false),
  },
  (t) => [unique().on(t.habitId, t.date)],
);

export const progressEntries = pgTable(
  "progress_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    weightKg: real("weight_kg"),
    waistCm: real("waist_cm"),
    chestCm: real("chest_cm"),
    armsCm: real("arms_cm"),
    beforePhotoUrl: text("before_photo_url"),
    afterPhotoUrl: text("after_photo_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.userId, t.date)],
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["user", "assistant"] }).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("chat_messages_user_id_created_at_idx").on(t.userId, t.createdAt)],
);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "unpaid",
  "paused",
]);
export const subscriptionPlanEnum = pgEnum("subscription_plan", ["monthly", "annual"]);

/** One row per user, kept in sync by the Stripe webhook — never trust client state for entitlement. */
export const subscriptions = pgTable(
  "subscriptions",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    stripeCustomerId: text("stripe_customer_id").notNull(),
    stripeSubscriptionId: text("stripe_subscription_id"),
    status: subscriptionStatusEnum("status").notNull().default("incomplete"),
    plan: subscriptionPlanEnum("plan"),
    currentPeriodEnd: timestamp("current_period_end"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.stripeCustomerId)],
);

export const streakState = pgTable("streak_state", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveDate: date("last_active_date"),
});
