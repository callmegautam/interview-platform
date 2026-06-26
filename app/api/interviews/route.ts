import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, unauthorized, serverError, requireDb } from "@/lib/api";
import { interviews, interviewQuestions, candidates } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateToken } from "@/lib/utils";
import { revalidatePath } from "next/cache";

const createInterviewSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  timeLimitMinutes: z.coerce.number().min(1, "Time limit must be at least 1 minute"),
  questionIds: z.array(z.string()).min(1, "Select at least one question"),
  candidateName: z.string().min(1, "Candidate name is required"),
  candidateEmail: z.string().email("Invalid email"),
  candidatePhone: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const db = requireDb();
    const list = await db
      .select()
      .from(interviews)
      .where(eq(interviews.companyId, session.userId))
      .orderBy(desc(interviews.createdAt));

    return NextResponse.json({ interviews: list });
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const parsed = createInterviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data = parsed.data;
    const db = requireDb();
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
    return NextResponse.json({ interview });
  } catch (err) {
    return serverError(err);
  }
}
