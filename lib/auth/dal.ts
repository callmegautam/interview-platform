import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "./session";
import { getDb } from "@/lib/db";
import { companies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect("/login");
  }

  return { isAuth: true, userId: session.userId, companyName: session.companyName };
});

export const getCompany = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

  const { db, error } = getDb();
  if (!db) {
    console.error("Failed to get company:", error);
    return null;
  }

  try {
    const result = await db
      .select({ id: companies.id, name: companies.name, email: companies.email })
      .from(companies)
      .where(eq(companies.id, session.userId))
      .limit(1);

    return result[0] ?? null;
  } catch {
    return null;
  }
});
