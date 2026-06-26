import { NextRequest, NextResponse } from "next/server";
import { getSession, unauthorized, serverError, requireDb } from "@/lib/api";
import { candidates } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await context.params;
    const db = requireDb();

    const list = await db
      .select()
      .from(candidates)
      .where(eq(candidates.interviewId, id))
      .orderBy(desc(candidates.createdAt));

    return NextResponse.json({ candidates: list });
  } catch (err) {
    return serverError(err);
  }
}
