import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, unauthorized, serverError, requireDb } from "@/lib/api";
import { candidates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; candidateId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { candidateId } = await context.params;
    const body = await req.json();
    const { status } = z.object({ status: z.enum(["passed", "failed"]) }).parse(body);

    const db = requireDb();
    await db.update(candidates).set({ status }).where(eq(candidates.id, candidateId));

    revalidatePath(`/interviews/${candidateId}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err);
  }
}
