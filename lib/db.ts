import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const connectionString =
  process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

if (!connectionString) {
  console.warn(
    "DATABASE_URL not set; database features will be disabled until configured"
  );
}

export const pool = connectionString ? new Pool({ connectionString }) : null;

export const db = pool ? drizzle(pool) : null;

export default db;
