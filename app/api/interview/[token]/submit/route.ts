import { NextRequest, NextResponse } from "next/server";
import { serverError, requireDb } from "@/lib/api";
import { candidates, answers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const body = await req.json();
    const db = requireDb();

    const candidate = await db
      .select({ id: candidates.id, interviewId: candidates.interviewId })
      .from(candidates)
      .where(eq(candidates.token, token))
      .limit(1);

    if (!candidate[0]) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    const answersData: { questionId: string; answerText?: string; code?: string; language?: string }[] = body.answers || [];

    for (const ans of answersData) {
      await db.insert(answers).values({
        candidateId: candidate[0].id,
        questionId: ans.questionId,
        answerText: ans.answerText || null,
        code: ans.code || null,
        language: ans.language || null,
      });
    }

    await db
      .update(candidates)
      .set({ status: "completed", completedAt: new Date() })
      .where(eq(candidates.id, candidate[0].id));

    return NextResponse.json({ candidateId: candidate[0].id });
  } catch (err) {
    return serverError(err);
  }
}
