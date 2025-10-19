// Drizzle config for migrations and type generation
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
import { existsSync } from "fs";

// Load env vars from .env.local if present, otherwise .env
if (existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
} else {
  dotenv.config();
}

const url = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
if (!url) {
  console.warn(
    "DATABASE_URL or NEON_DATABASE_URL not set; drizzle migrate may fail."
  );
}

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: url || "",
  },
});
