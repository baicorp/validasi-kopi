import "dotenv/config";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local", override: true });

export default defineConfig({
  out: "./src/db/migration",
  schema: "./src/db/schema.ts",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});
