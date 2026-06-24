import { getDb } from "@/lib/db";
import { questions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifySession } from "@/lib/auth/dal";
import { redirect } from "next/navigation";
import { InterviewForm } from "./interview-form";
import { Card, CardContent } from "@/components/ui/card";

export default async function NewInterviewPage() {
  const session = await verifySession();
  if (!session) redirect("/login");

  const { db, error } = getDb();

  if (!db || error) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create interview</h1>
          <p className="text-sm text-muted-foreground">
            Set up a new interview with questions and candidate details
          </p>
        </div>
        <Card>
          <CardContent className="py-8 text-center text-sm text-destructive">
            Database is not available. Please check your configuration and try again.
          </CardContent>
        </Card>
      </div>
    );
  }

  const companyQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.companyId, session.userId))
    .orderBy(desc(questions.createdAt));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create interview</h1>
        <p className="text-sm text-muted-foreground">
          Set up a new interview with questions and candidate details
        </p>
      </div>
      <InterviewForm questions={companyQuestions} />
    </div>
  );
}
