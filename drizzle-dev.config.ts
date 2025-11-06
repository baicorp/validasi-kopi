import "dotenv/config";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local", override: true });

// ### turso sqlite setup ###
export default defineConfig({
  out: "./src/db/migration",
  schema: "./src/db/schema",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});

// ### mysql setup ###
// export default defineConfig({
//   out: "./src/db/migration/mysql",
//   schema: "./src/db/schema/mysql",
//   dialect: "mysql",
//   dbCredentials: {
//     host: process.env.MYSQL_DATABASE_HOST!,
//     user: process.env.MYSQL_DATABASE_USER!,
//     password: process.env.MYSQL_DATABASE_PASSWORD!,
//     database: process.env.MYSQL_DATABASE_NAME!,
//   },
// });
