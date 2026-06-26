import { NextRequest, NextResponse } from "next/server";
import { getSession, unauthorized, serverError, requireDb } from "@/lib/api";
import { interviewQuestions, questions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
      .select({
        questionId: interviewQuestions.questionId,
        order: interviewQuestions.order,
        title: questions.title,
        type: questions.type,
        language: questions.language,
      })
      .from(interviewQuestions)
      .innerJoin(questions, eq(interviewQuestions.questionId, questions.id))
      .where(eq(interviewQuestions.interviewId, id))
      .orderBy(interviewQuestions.order);

    return NextResponse.json({ questions: list });
  } catch (err) {
    return serverError(err);
  }
}
