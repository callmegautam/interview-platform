import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { candidates, flags } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const { type } = await req.json();

    if (!type || !["tab_switch", "app_switch"].includes(type)) {
      return NextResponse.json({ error: "Invalid flag type" }, { status: 400 });
    }

    const { db, error: dbError } = getDb();
    if (!db) {
      return NextResponse.json(
        { error: dbError || "Database is not available" },
        { status: 503 }
      );
    }

    const candidate = await db
      .select({ id: candidates.id })
      .from(candidates)
      .where(eq(candidates.token, token))
      .limit(1);

    if (!candidate[0]) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    await db.insert(flags).values({
      candidateId: candidate[0].id,
      type: type as "tab_switch" | "app_switch",
      details: type === "app_switch"
        ? "Window lost focus"
        : "Tab became hidden",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Flag error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
