import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL must be set. Did you forget to provision a database?");
  process.exit(1);
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool, { schema });
