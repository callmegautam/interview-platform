"use server";

import { redirect } from "next/navigation";
import { getDb, type Database } from "@/lib/db";
import { companies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { signupSchema, loginSchema } from "./schema";
import { createSession, deleteSession } from "./session";

const DB_UNAVAILABLE = "Database is not available. Please check your configuration and try again.";

function requireDb(): Database {
  const { db, error } = getDb();
  if (!db) throw new Error(error || DB_UNAVAILABLE);
  return db;
}

function isRedirectError(err: unknown): boolean {
  return err instanceof Error && "digest" in err && String((err as any).digest).startsWith("NEXT_REDIRECT");
}

export async function signup(_prevState: unknown, formData: FormData) {
  try {
    const parsed = signupSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const { name, email, password } = parsed.data;
    const db = requireDb();

    const existing = await db
      .select({ id: companies.id })
      .from(companies)
      .where(eq(companies.email, email))
      .limit(1);

    if (existing.length > 0) {
      return { error: "An account with this email already exists" };
    }

    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await db
      .insert(companies)
      .values({ name, email, passwordHash })
      .returning({ id: companies.id, name: companies.name });

    const company = result[0];
    await createSession(company.id, company.name);
    redirect("/interviews");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: err instanceof Error ? err.message : DB_UNAVAILABLE };
  }
}

export async function login(_prevState: unknown, formData: FormData) {
  try {
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const { email, password } = parsed.data;
    const db = requireDb();

    const result = await db
      .select({ id: companies.id, name: companies.name, passwordHash: companies.passwordHash })
      .from(companies)
      .where(eq(companies.email, email))
      .limit(1);

    if (result.length === 0) {
      return { error: "Invalid email or password" };
    }

    const company = result[0];
    const bcrypt = await import("bcryptjs");
    const valid = await bcrypt.compare(password, company.passwordHash);

    if (!valid) {
      return { error: "Invalid email or password" };
    }

    await createSession(company.id, company.name);
    redirect("/interviews");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: err instanceof Error ? err.message : DB_UNAVAILABLE };
  }
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
