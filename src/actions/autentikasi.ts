"use server";

import { auth } from "@/lib/auth";

export async function signup() {
  await auth.api.signUpEmail({
    body: {
      email: "qa@mail.com", // required
      name: "Quality Assurance", // required
      password: "supersecure", // required
      username: "qualityassurance", // required
      displayUsername: "Quality Assurance",
    },
  });
}
