import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, unauthorized, serverError, requireDb } from "@/lib/api";
import { scores } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const scoreSchema = z.object({
  questionId: z.string(),
  score: z.coerce.number().min(0).max(10),
  feedback: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; candidateId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id: interviewId, candidateId } = await context.params;
    const body = await req.json();
    const parsed = scoreSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const db = requireDb();

    const existing = await db
      .select({ id: scores.id })
      .from(scores)
      .where(
        and(
          eq(scores.companyId, session.userId),
          eq(scores.candidateId, candidateId),
          eq(scores.questionId, parsed.data.questionId),
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(scores)
        .set({ score: parsed.data.score, feedback: parsed.data.feedback || null })
        .where(eq(scores.id, existing[0].id));
    } else {
      await db.insert(scores).values({
        companyId: session.userId,
        candidateId,
        questionId: parsed.data.questionId,
        score: parsed.data.score,
        feedback: parsed.data.feedback || null,
      });
    }

    revalidatePath(`/interviews/${interviewId}/candidates/${candidateId}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err);
  }
}
