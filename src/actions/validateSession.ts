"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function validateSessionServer() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}

export async function isValidRole(role: "admin" | "user") {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session && session.user.role === role) return true;

  return false;
}
