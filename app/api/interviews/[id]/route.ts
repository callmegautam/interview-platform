import { NextRequest, NextResponse } from "next/server";
import { getSession, unauthorized, serverError, notFound, requireDb } from "@/lib/api";
import { interviews } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await context.params;
    const db = requireDb();

    const result = await db
      .select()
      .from(interviews)
      .where(and(eq(interviews.id, id), eq(interviews.companyId, session.userId)))
      .limit(1);

    if (!result[0]) return notFound("Interview not found");
    return NextResponse.json({ interview: result[0] });
  } catch (err) {
    return serverError(err);
  }
}
