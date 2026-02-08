import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql"; // for turso sqlite
import { createClient } from "@libsql/client"; // for turso sqlite

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const db = drizzle({ client });

export { db };
