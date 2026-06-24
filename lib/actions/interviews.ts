"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb, type Database } from "@/lib/db";
import { interviews, interviewQuestions, candidates, questions as questionsTable } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { verifySession } from "@/lib/auth/dal";
import { revalidatePath } from "next/cache";
import { generateToken } from "@/lib/utils";

const DB_UNAVAILABLE = "Database is not available. Please check your configuration and try again.";

function requireDb(): Database {
  const { db, error } = getDb();
  if (!db) throw new Error(error || DB_UNAVAILABLE);
  return db;
}

const createInterviewSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  timeLimitMinutes: z.coerce.number().min(1, "Time limit must be at least 1 minute"),
  questionIds: z.array(z.string()).min(1, "Select at least one question"),
  candidateName: z.string().min(1, "Candidate name is required"),
  candidateEmail: z.string().email("Invalid email"),
  candidatePhone: z.string().optional(),
});

export async function createInterview(_prevState: unknown, formData: FormData) {
  try {
    const session = await verifySession();
    if (!session) redirect("/login");

    const db = requireDb();

    const questionIds = formData.getAll("questionIds").map(String);

    const parsed = createInterviewSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      timeLimitMinutes: formData.get("timeLimitMinutes"),
      questionIds,
      candidateName: formData.get("candidateName"),
      candidateEmail: formData.get("candidateEmail"),
      candidatePhone: formData.get("candidatePhone") || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const data = parsed.data;
    const token = generateToken();

    const [interview] = await db
      .insert(interviews)
      .values({
        companyId: session.userId,
        title: data.title,
        description: data.description,
        timeLimitMinutes: data.timeLimitMinutes,
        status: "active",
      })
      .returning();

    await db.insert(interviewQuestions).values(
      data.questionIds.map((qId, idx) => ({
        interviewId: interview.id,
        questionId: qId,
        order: idx + 1,
      }))
    );

    await db.insert(candidates).values({
      interviewId: interview.id,
      name: data.candidateName,
      email: data.candidateEmail,
      phone: data.candidatePhone || null,
      token,
    });

    revalidatePath("/interviews");
    redirect(`/interviews/${interview.id}`);
  } catch (err) {
    if (err instanceof Error && "digest" in err && String((err as any).digest).startsWith("NEXT_REDIRECT")) throw err;
    return { error: err instanceof Error ? err.message : DB_UNAVAILABLE };
  }
}

export async function getInterviews() {
  try {
    const session = await verifySession();
    if (!session) return [];

    const { db, error } = getDb();
    if (!db) {
      console.error("Failed to fetch interviews:", error);
      return [];
    }

    return await db
      .select()
      .from(interviews)
      .where(eq(interviews.companyId, session.userId))
      .orderBy(desc(interviews.createdAt));
  } catch (err) {
    console.error("Failed to fetch interviews:", err);
    return [];
  }
}

export async function getInterview(id: string) {
  try {
    const session = await verifySession();
    if (!session) return null;

    const { db, error } = getDb();
    if (!db) {
      console.error("Failed to fetch interview:", error);
      return null;
    }

    const results = await db
      .select()
      .from(interviews)
      .where(and(eq(interviews.id, id), eq(interviews.companyId, session.userId)))
      .limit(1);

    return results[0] ?? null;
  } catch (err) {
    console.error("Failed to fetch interview:", err);
    return null;
  }
}

export async function getInterviewCandidates(interviewId: string) {
  try {
    await verifySession();

    const { db, error } = getDb();
    if (!db) {
      console.error("Failed to fetch candidates:", error);
      return [];
    }

    return await db
      .select()
      .from(candidates)
      .where(eq(candidates.interviewId, interviewId))
      .orderBy(desc(candidates.createdAt));
  } catch (err) {
    console.error("Failed to fetch candidates:", err);
    return [];
  }
}

export async function getInterviewQuestions(interviewId: string) {
  try {
    await verifySession();

    const { db, error } = getDb();
    if (!db) {
      console.error("Failed to fetch interview questions:", error);
      return [];
    }

    const iqs = await db
      .select({
        questionId: interviewQuestions.questionId,
        order: interviewQuestions.order,
        title: questionsTable.title,
        type: questionsTable.type,
        language: questionsTable.language,
      })
      .from(interviewQuestions)
      .innerJoin(questionsTable, eq(interviewQuestions.questionId, questionsTable.id))
      .where(eq(interviewQuestions.interviewId, interviewId))
      .orderBy(interviewQuestions.order);

    return iqs;
  } catch (err) {
    console.error("Failed to fetch interview questions:", err);
    return [];
  }
}
