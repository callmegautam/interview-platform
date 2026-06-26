import { NextRequest, NextResponse } from "next/server";
import { getSession, unauthorized, serverError, requireDb } from "@/lib/api";
import { questions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await context.params;
    const db = requireDb();

    await db.delete(questions).where(eq(questions.id, id));

    revalidatePath("/questions");
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err);
  }
}
