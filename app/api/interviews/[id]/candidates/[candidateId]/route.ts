import { NextRequest, NextResponse } from "next/server";
import { getSession, unauthorized, serverError, notFound, requireDb } from "@/lib/api";
import { candidates, answers, questions, interviewQuestions, recordings, flags, scores } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string; candidateId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id: interviewId, candidateId } = await context.params;
    const db = requireDb();

    const [candidate] = await db
      .select()
      .from(candidates)
      .where(and(eq(candidates.id, candidateId), eq(candidates.interviewId, interviewId)))
      .limit(1);

    if (!candidate) return notFound("Candidate not found");

    const [answersList, recordingsList, flagsList, allQuestions, existingScores] = await Promise.all([
      db
        .select({
          id: answers.id,
          answerText: answers.answerText,
          code: answers.code,
          language: answers.language,
          questionId: answers.questionId,
          questionTitle: questions.title,
          questionType: questions.type,
          questionOrder: interviewQuestions.order,
        })
        .from(answers)
        .innerJoin(questions, eq(answers.questionId, questions.id))
        .innerJoin(interviewQuestions, eq(answers.questionId, interviewQuestions.questionId))
        .where(eq(answers.candidateId, candidateId))
        .orderBy(interviewQuestions.order),
      db
        .select()
        .from(recordings)
        .where(eq(recordings.candidateId, candidateId)),
      db
        .select()
        .from(flags)
        .where(eq(flags.candidateId, candidateId))
        .orderBy(desc(flags.createdAt)),
      db
        .select({
          id: questions.id,
          title: questions.title,
          type: questions.type,
          order: interviewQuestions.order,
        })
        .from(questions)
        .innerJoin(interviewQuestions, eq(questions.id, interviewQuestions.questionId))
        .where(eq(interviewQuestions.interviewId, interviewId))
        .orderBy(interviewQuestions.order),
      db
        .select()
        .from(scores)
        .where(and(eq(scores.candidateId, candidateId), eq(scores.companyId, session.userId))),
    ]);

    return NextResponse.json({
      candidate,
      answers: answersList,
      recordings: recordingsList,
      flags: flagsList,
      questions: allQuestions,
      scores: existingScores,
    });
  } catch (err) {
    return serverError(err);
  }
}
