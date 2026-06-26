import { NextRequest, NextResponse } from "next/server";
import { requireDb, serverError } from "@/lib/api";
import { candidates, interviews, interviewQuestions, questions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const db = requireDb();

    const result = await db
      .select({
        id: candidates.id,
        name: candidates.name,
        email: candidates.email,
        status: candidates.status,
        interview: {
          id: interviews.id,
          title: interviews.title,
          description: interviews.description,
          timeLimitMinutes: interviews.timeLimitMinutes,
        },
      })
      .from(candidates)
      .innerJoin(interviews, eq(candidates.interviewId, interviews.id))
      .where(eq(candidates.token, token))
      .limit(1);

    if (!result[0]) {
      return NextResponse.json({ error: "Invalid or expired interview link" }, { status: 404 });
    }

    const data = result[0];
    const interviewId = data.interview.id;

    const questionsList = await db
      .select({
        id: questions.id,
        title: questions.title,
        description: questions.description,
        type: questions.type,
        language: questions.language,
        codeStarter: questions.codeStarter,
        order: interviewQuestions.order,
      })
      .from(interviewQuestions)
      .innerJoin(questions, eq(interviewQuestions.questionId, questions.id))
      .where(eq(interviewQuestions.interviewId, interviewId))
      .orderBy(interviewQuestions.order);

    return NextResponse.json({
      candidate: {
        name: data.name,
        email: data.email,
        status: data.status,
      },
      interview: data.interview,
      questions: questionsList,
    });
  } catch (err) {
    return serverError(err);
  }
}
