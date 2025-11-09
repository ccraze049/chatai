import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

let db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!db) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    db = drizzle(pool, { schema });
  }

  return db;
}
