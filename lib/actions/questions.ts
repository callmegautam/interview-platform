"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb, type Database } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { verifySession } from "@/lib/auth/dal";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const DB_UNAVAILABLE = "Database is not available. Please check your configuration and try again.";

const questionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["code", "text"]),
  language: z.string().optional(),
  codeStarter: z.string().optional(),
});

function requireDb(): Database {
  const { db, error } = getDb();
  if (!db) throw new Error(error || DB_UNAVAILABLE);
  return db;
}

export async function createQuestion(_prevState: unknown, formData: FormData) {
  try {
    const session = await verifySession();
    if (!session) redirect("/login");

    const db = requireDb();

    const parsed = questionSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      type: formData.get("type"),
      language: formData.get("language") || undefined,
      codeStarter: formData.get("codeStarter") || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const data = parsed.data;

    await db.insert(questions).values({
      companyId: session.userId,
      title: data.title,
      description: data.description,
      type: data.type,
      language: data.type === "code" ? data.language : null,
      codeStarter: data.type === "code" ? data.codeStarter : null,
    });

    revalidatePath("/questions");
    redirect("/questions");
  } catch (err) {
    if (err instanceof Error && "digest" in err && String((err as any).digest).startsWith("NEXT_REDIRECT")) throw err;
    return { error: err instanceof Error ? err.message : DB_UNAVAILABLE };
  }
}

export async function deleteQuestion(questionId: string) {
  try {
    const session = await verifySession();
    if (!session) redirect("/login");

    const db = requireDb();

    await db.delete(questions).where(eq(questions.id, questionId));
    revalidatePath("/questions");
  } catch (err) {
    if (err instanceof Error && "digest" in err && String((err as any).digest).startsWith("NEXT_REDIRECT")) throw err;
    console.error("Failed to delete question:", err);
  }
}

export async function getQuestions() {
  try {
    const session = await verifySession();
    if (!session) return [];

    const { db, error } = getDb();
    if (!db) {
      console.error("Failed to fetch questions:", error);
      return [];
    }

    return await db
      .select()
      .from(questions)
      .where(eq(questions.companyId, session.userId))
      .orderBy(desc(questions.createdAt));
  } catch (err) {
    console.error("Failed to fetch questions:", err);
    return [];
  }
}
