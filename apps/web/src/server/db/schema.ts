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
  primaryKey,
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

/**
 * Fixed-window request counter for API rate limiting. One row per
 * (key, window). Old windows are never read again after they close, so
 * they're just left to accumulate — cheap enough at this scale, revisit
 * with a periodic cleanup job if the table ever becomes a concern.
 */
export const apiRateLimits = pgTable(
  "api_rate_limits",
  {
    key: text("key").notNull(),
    windowStart: timestamp("window_start").notNull(),
    count: integer("count").notNull().default(1),
  },
  (t) => [primaryKey({ columns: [t.key, t.windowStart] })],
);

export const waitlistStatusEnum = pgEnum("waitlist_status", ["waiting", "invited", "joined"]);

/**
 * One row per waitlist signup. `referralCode` is this person's own
 * shareable code; `referredByCode` is whose code brought them here — both
 * live on the same table since referral is just waitlist attribution, not
 * a separate rewards system. `inviteCode` is set when an admin invites
 * them and is what gates actual product access (see billing/access.ts).
 */
export const waitlistEntries = pgTable(
  "waitlist_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    name: text("name"),
    referralCode: text("referral_code").notNull(),
    referredByCode: text("referred_by_code"),
    status: waitlistStatusEnum("status").notNull().default("waiting"),
    inviteCode: text("invite_code"),
    joinedUserId: text("joined_user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    invitedAt: timestamp("invited_at"),
    joinedAt: timestamp("joined_at"),
  },
  (t) => [unique().on(t.email), unique().on(t.referralCode), unique().on(t.inviteCode)],
);

export const feedbackTypeEnum = pgEnum("feedback_type", ["feedback", "bug"]);
export const feedbackStatusEnum = pgEnum("feedback_status", ["new", "reviewed", "resolved"]);

export const feedbackEntries = pgTable(
  "feedback_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: feedbackTypeEnum("type").notNull(),
    message: text("message").notNull(),
    pageUrl: text("page_url"),
    screenshotUrl: text("screenshot_url"),
    status: feedbackStatusEnum("status").notNull().default("new"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("feedback_entries_user_id_idx").on(t.userId)],
);

export const featureRequestStatusEnum = pgEnum("feature_request_status", [
  "open",
  "planned",
  "shipped",
  "declined",
]);

export const featureRequests = pgTable("feature_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: featureRequestStatusEnum("status").notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const featureRequestVotes = pgTable(
  "feature_request_votes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    featureRequestId: uuid("feature_request_id")
      .notNull()
      .references(() => featureRequests.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.featureRequestId, t.userId)],
);
