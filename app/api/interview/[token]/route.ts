import { NextRequest, NextResponse } from "next/server";
import { validateInterviewToken, getInterviewQuestionsByToken } from "@/lib/actions/interview-take";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const [data, questions] = await Promise.all([
      validateInterviewToken(token),
      getInterviewQuestionsByToken(token),
    ]);

    if (!data) {
      return NextResponse.json({ error: "Invalid or expired interview link" }, { status: 404 });
    }

    return NextResponse.json({
      candidate: {
        name: data.name,
        email: data.email,
        status: data.status,
      },
      interview: data.interview,
      questions,
    });
  } catch (err) {
    console.error("Token validation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
