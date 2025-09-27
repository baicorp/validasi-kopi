import * as schema from "@/db/schema";
import { db } from "@/db";
import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  plugins: [username(), nextCookies()],
  database: drizzleAdapter(db, {
    schema,
    provider: "sqlite", // or "mysql", "sqlite"
  }),
});
