import { NextRequest, NextResponse } from "next/server";
import { serverError, requireDb } from "@/lib/api";
import { candidates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const db = requireDb();

    await db
      .update(candidates)
      .set({ status: "in_progress", startedAt: new Date() })
      .where(eq(candidates.token, token));

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err);
  }
}
