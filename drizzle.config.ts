import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/db/migration",
  schema: "./src/db/schema",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.MYSQL_DATABASE_HOST!,
    user: process.env.MYSQL_DATABASE_USER!,
    password: process.env.MYSQL_DATABASE_PASSWORD!,
    database: process.env.MYSQL_DATABASE_NAME!,
  },
});
