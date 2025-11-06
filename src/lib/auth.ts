import { db } from "@/db";
import * as schema from "@/db/schema"; // for turso sqlite
// import * as schema from "@/db/schema/mysql"; // for mysql
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin, username } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  plugins: [username(), nextCookies(), admin()],
  database: drizzleAdapter(db, {
    schema,
    provider: "sqlite", // for sqlite DB
    // provider: "mysql", // for mysql DB
  }),
  user: {
    additionalFields: {
      username: {
        type: "string",
        unique: true,
        required: true,
      },
      position: {
        type: "string",
        required: true,
      },
    },
  },
});
