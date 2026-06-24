"use server";

import { getDb, type Database } from "@/lib/db";
import { candidates, interviews, interviewQuestions, questions, answers, recordings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const DB_UNAVAILABLE = "Database is not available. Please check your configuration.";

function requireDb(): Database {
  const { db, error } = getDb();
  if (!db) throw new Error(error || DB_UNAVAILABLE);
  return db;
}

export async function validateInterviewToken(token: string) {
  try {
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

    return result[0] ?? null;
  } catch (err) {
    console.error("Failed to validate token:", err);
    return null;
  }
}

export async function getInterviewQuestionsByToken(token: string) {
  try {
    const db = requireDb();

    const candidate = await db
      .select({ interviewId: candidates.interviewId })
      .from(candidates)
      .where(eq(candidates.token, token))
      .limit(1);

    if (!candidate[0]) return [];

    return await db
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
      .where(eq(interviewQuestions.interviewId, candidate[0].interviewId))
      .orderBy(interviewQuestions.order);
  } catch (err) {
    console.error("Failed to fetch questions:", err);
    return [];
  }
}

export async function startInterview(token: string) {
  const db = requireDb();

  await db
    .update(candidates)
    .set({ status: "in_progress", startedAt: new Date() })
    .where(eq(candidates.token, token));
}

export async function submitAnswers(
  token: string,
  answersData: { questionId: string; answerText?: string; code?: string; language?: string }[]
) {
  const db = requireDb();

  const candidate = await db
    .select({ id: candidates.id, interviewId: candidates.interviewId })
    .from(candidates)
    .where(eq(candidates.token, token))
    .limit(1);

  if (!candidate[0]) throw new Error("Invalid token");

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

  return candidate[0].id;
}

export async function saveRecording(
  token: string,
  type: "screen" | "webcam",
  storagePath: string,
  fileSize: number
) {
  try {
    const db = requireDb();

    const candidate = await db
      .select({ id: candidates.id })
      .from(candidates)
      .where(eq(candidates.token, token))
      .limit(1);

    if (!candidate[0]) throw new Error("Invalid token");

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.insert(recordings).values({
      candidateId: candidate[0].id,
      type,
      storagePath,
      fileSize,
      expiresAt,
    });
  } catch (err) {
    console.error("Failed to save recording:", err);
  }
}
