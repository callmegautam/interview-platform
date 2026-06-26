import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { companies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { loginSchema } from "@/lib/auth/schema";
import { createSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const { db, error } = getDb();
    if (!db) {
      return NextResponse.json({ error: error || "Database unavailable" }, { status: 503 });
    }

    const result = await db
      .select({ id: companies.id, name: companies.name, passwordHash: companies.passwordHash })
      .from(companies)
      .where(eq(companies.email, email))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const company = result[0];
    const bcrypt = await import("bcryptjs");
    const valid = await bcrypt.compare(password, company.passwordHash);

    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    await createSession(company.id, company.name);

    return NextResponse.json({ redirect: "/interviews" });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Login failed" },
      { status: 500 }
    );
  }
}
