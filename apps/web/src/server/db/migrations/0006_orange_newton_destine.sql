CREATE TABLE "api_rate_limits" (
	"key" text NOT NULL,
	"window_start" timestamp NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "api_rate_limits_key_window_start_pk" PRIMARY KEY("key","window_start")
);
