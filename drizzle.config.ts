import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/db/migration",
  schema: "./src/db/schema",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.MYSQL_DATABASE_URL!,
  },
});
