import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { companies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { signupSchema } from "@/lib/auth/schema";
import { createSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, email, password } = parsed.data;
    const { db, error } = getDb();
    if (!db) {
      return NextResponse.json({ error: error || "Database unavailable" }, { status: 503 });
    }

    const existing = await db
      .select({ id: companies.id })
      .from(companies)
      .where(eq(companies.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await db
      .insert(companies)
      .values({ name, email, passwordHash })
      .returning({ id: companies.id, name: companies.name });

    const company = result[0];
    await createSession(company.id, company.name);

    return NextResponse.json({ redirect: "/interviews" });
  } catch (err) {
    console.error("Signup error:", err);
    console.error("DB", process.env.DATABASE_URL);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Signup failed" },
      { status: 500 }
    );
  }
}
