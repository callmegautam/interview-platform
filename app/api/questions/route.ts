import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, unauthorized, serverError, requireDb } from "@/lib/api";
import { questions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const questionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["code", "text"]),
  language: z.string().optional(),
  codeStarter: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const db = requireDb();
    const list = await db
      .select()
      .from(questions)
      .where(eq(questions.companyId, session.userId))
      .orderBy(desc(questions.createdAt));

    return NextResponse.json({ questions: list });
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const parsed = questionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data = parsed.data;
    const db = requireDb();

    const [question] = await db
      .insert(questions)
      .values({
        companyId: session.userId,
        title: data.title,
        description: data.description,
        type: data.type,
        language: data.type === "code" ? data.language : null,
        codeStarter: data.type === "code" ? data.codeStarter : null,
      })
      .returning();

    revalidatePath("/questions");
    return NextResponse.json({ question });
  } catch (err) {
    return serverError(err);
  }
}
