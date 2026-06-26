import { NextResponse } from "next/server";
import { getSession, unauthorized, serverError } from "@/lib/api";
import { getDb } from "@/lib/db";
import { companies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { db, error } = getDb();
    if (!db) {
      return NextResponse.json({ error: error || "Database unavailable" }, { status: 503 });
    }

    const result = await db
      .select({ id: companies.id, name: companies.name, email: companies.email })
      .from(companies)
      .where(eq(companies.id, session.userId))
      .limit(1);

    return NextResponse.json({ company: result[0] ?? null });
  } catch (err) {
    return serverError(err);
  }
}
