"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb, type Database } from "@/lib/db";
import { scores, candidates } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { verifySession } from "@/lib/auth/dal";
import { revalidatePath } from "next/cache";

const DB_UNAVAILABLE = "Database is not available. Please check your configuration and try again.";

function requireDb(): Database {
  const { db, error } = getDb();
  if (!db) throw new Error(error || DB_UNAVAILABLE);
  return db;
}

const scoreSchema = z.object({
  questionId: z.string(),
  score: z.coerce.number().min(0).max(10),
  feedback: z.string().optional(),
});

export async function saveScore(prevState: unknown, formData: FormData) {
  try {
    const session = await verifySession();
    if (!session) redirect("/login");

    const db = requireDb();

    const candidateId = formData.get("candidateId") as string;
    const interviewId = formData.get("interviewId") as string;

    const parsed = scoreSchema.safeParse({
      questionId: formData.get("questionId"),
      score: formData.get("score"),
      feedback: formData.get("feedback") || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

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
    return { success: true };
  } catch (err) {
    if (err instanceof Error && "digest" in err && String((err as any).digest).startsWith("NEXT_REDIRECT")) throw err;
    return { error: err instanceof Error ? err.message : DB_UNAVAILABLE };
  }
}

export async function markCandidate(candidateId: string, status: "passed" | "failed") {
  try {
    const session = await verifySession();
    if (!session) redirect("/login");

    const db = requireDb();

    await db.update(candidates).set({ status }).where(eq(candidates.id, candidateId));
    revalidatePath(`/interviews/${candidateId}`);
  } catch (err) {
    if (err instanceof Error && "digest" in err && String((err as any).digest).startsWith("NEXT_REDIRECT")) throw err;
    console.error("Failed to mark candidate:", err);
  }
}
