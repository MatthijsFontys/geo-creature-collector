import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Create a single instance of the connection pool
// Optionally, export the pool if needed for raw queries
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize Drizzle ORM with the connection pool
export const db = drizzle(pool);
