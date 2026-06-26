import { NextRequest, NextResponse } from "next/server";
import { serverError, requireDb } from "@/lib/api";
import { candidates, recordings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const body = await req.json();
    const { type, storagePath, fileSize } = body;

    if (!type || !["screen", "webcam"].includes(type)) {
      return NextResponse.json({ error: "Invalid recording type" }, { status: 400 });
    }

    const db = requireDb();

    const candidate = await db
      .select({ id: candidates.id })
      .from(candidates)
      .where(eq(candidates.token, token))
      .limit(1);

    if (!candidate[0]) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.insert(recordings).values({
      candidateId: candidate[0].id,
      type,
      storagePath,
      fileSize,
      expiresAt,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err);
  }
}
