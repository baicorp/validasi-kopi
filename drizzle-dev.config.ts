import "dotenv/config";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local", override: true });

// ### mysql setup ###
export default defineConfig({
  out: "./src/db/migration",
  schema: "./src/db/schema",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.MYSQL_DATABASE_URL!,
  },
});
