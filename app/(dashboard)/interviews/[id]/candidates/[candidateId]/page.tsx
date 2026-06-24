import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { candidates, answers, questions, interviewQuestions, recordings, flags, scores } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { verifySession } from "@/lib/auth/dal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/lib/utils";
import { ScoreForm } from "./score-form";
import { MarkForm } from "./mark-form";

export default async function CandidateDetailPage(props: {
  params: Promise<{ id: string; candidateId: string }>;
}) {
  const { id: interviewId, candidateId } = await props.params;
  const session = await verifySession();
  if (!session) notFound();

  const { db, error } = getDb();

  if (!db || error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8 text-center text-sm text-destructive">
            Database is not available. Please check your configuration and try again.
          </CardContent>
        </Card>
      </div>
    );
  }

  const [candidate] = await db
    .select()
    .from(candidates)
    .where(and(eq(candidates.id, candidateId), eq(candidates.interviewId, interviewId)))
    .limit(1);

  if (!candidate) notFound();

  const [answersList, recordingsList, flagsList, allQuestions, existingScores] = await Promise.all([
    db
      .select({
        id: answers.id,
        answerText: answers.answerText,
        code: answers.code,
        language: answers.language,
        questionId: answers.questionId,
        questionTitle: questions.title,
        questionType: questions.type,
        questionOrder: interviewQuestions.order,
      })
      .from(answers)
      .innerJoin(questions, eq(answers.questionId, questions.id))
      .innerJoin(interviewQuestions, eq(answers.questionId, interviewQuestions.questionId))
      .where(eq(answers.candidateId, candidateId))
      .orderBy(interviewQuestions.order),
    db
      .select()
      .from(recordings)
      .where(eq(recordings.candidateId, candidateId)),
    db
      .select()
      .from(flags)
      .where(eq(flags.candidateId, candidateId))
      .orderBy(desc(flags.createdAt)),
    db
      .select({
        id: questions.id,
        title: questions.title,
        type: questions.type,
        order: interviewQuestions.order,
      })
      .from(questions)
      .innerJoin(interviewQuestions, eq(questions.id, interviewQuestions.questionId))
      .where(eq(interviewQuestions.interviewId, interviewId))
      .orderBy(interviewQuestions.order),
    db
      .select()
      .from(scores)
      .where(and(eq(scores.candidateId, candidateId), eq(scores.companyId, session.userId))),
  ]);

  const scoreMap = new Map(existingScores.map((s) => [s.questionId, s]));
  const avgScore = existingScores.length > 0
    ? (existingScores.reduce((sum, s) => sum + s.score, 0) / existingScores.length).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{candidate.name}</h1>
          <p className="text-sm text-muted-foreground">{candidate.email}</p>
        </div>
        <div className="flex items-center gap-3">
          {avgScore && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Average score</p>
              <p className="text-2xl font-bold">{avgScore}/10</p>
            </div>
          )}
          <Badge
            variant={
              candidate.status === "passed" ? "default" :
              candidate.status === "failed" ? "destructive" :
              candidate.status === "completed" ? "secondary" :
              "outline"
            }
            className="text-sm"
          >
            {candidate.status}
          </Badge>
        </div>
      </div>

      <MarkForm candidateId={candidate.id} currentStatus={candidate.status} />

      <Separator />

      {flagsList.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-base text-destructive">
              Flags ({flagsList.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {flagsList.map((f) => (
                  <div key={f.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{f.type.replace("_", " ")}</span>
                    <span className="text-muted-foreground">{formatDate(f.createdAt)}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {recordingsList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recordings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recordingsList.map((r) => (
              <div key={r.id}>
                <p className="text-sm font-medium">{r.type} recording</p>
                <p className="text-xs text-muted-foreground">
                  Recorded {formatDate(r.createdAt)} · Expires {formatDate(r.expiresAt)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <h2 className="text-lg font-medium">Questions & Answers</h2>
        {allQuestions.map((q) => {
          const answer = answersList.find((a) => a.questionId === q.id);
          const currentScore = scoreMap.get(q.id);

          return (
            <Card key={q.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{q.title}</CardTitle>
                    <Badge variant="outline" className="mt-1 text-xs">{q.type}</Badge>
                  </div>
                  {currentScore && (
                    <Badge>{currentScore.score}/10</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {answer ? (
                  <>
                    {answer.answerText && (
                      <div className="rounded-md bg-muted p-4">
                        <pre className="whitespace-pre-wrap text-sm">{answer.answerText}</pre>
                      </div>
                    )}
                    {answer.code && (
                      <div className="rounded-md bg-zinc-950 p-4">
                        <pre className="overflow-x-auto text-sm text-zinc-50"><code>{answer.code}</code></pre>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No answer submitted</p>
                )}

                <Separator />

                <ScoreForm
                  questionId={q.id}
                  candidateId={candidateId}
                  interviewId={interviewId}
                  currentScore={currentScore?.score ?? null}
                  currentFeedback={currentScore?.feedback ?? null}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
