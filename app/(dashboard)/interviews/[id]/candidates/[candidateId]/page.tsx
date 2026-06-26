"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiGet } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import { ScoreForm } from "./score-form";
import { MarkForm } from "./mark-form";

interface Candidate {
  id: string;
  name: string;
  email: string;
  status: string;
}

interface Answer {
  id: string;
  answerText: string | null;
  code: string | null;
  language: string | null;
  questionId: string;
  questionTitle: string;
  questionType: string;
  questionOrder: number;
}

interface Recording {
  id: string;
  type: string;
  createdAt: string;
  expiresAt: string;
}

interface Flag {
  id: string;
  type: string;
  createdAt: string;
}

interface Question {
  id: string;
  title: string;
  type: string;
  order: number;
}

interface Score {
  questionId: string;
  score: number;
  feedback: string | null;
}

export default function CandidateDetailPage() {
  const params = useParams<{ id: string; candidateId: string }>();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiGet<{
          candidate: Candidate;
          answers: Answer[];
          recordings: Recording[];
          flags: Flag[];
          questions: Question[];
          scores: Score[];
        }>(`/api/interviews/${params.id}/candidates/${params.candidateId}`);
        setCandidate(res.candidate);
        setAnswers(res.answers);
        setRecordings(res.recordings);
        setFlags(res.flags);
        setQuestions(res.questions);
        setScores(res.scores);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, params.candidateId]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  if (!candidate) {
    return <p className="text-destructive">Candidate not found</p>;
  }

  const scoreMap = new Map(scores.map((s) => [s.questionId, s]));
  const avgScore = scores.length > 0
    ? (scores.reduce((sum, s) => sum + s.score, 0) / scores.length).toFixed(1)
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

      <MarkForm candidateId={candidate.id} currentStatus={candidate.status} interviewId={params.id} />

      <Separator />

      {flags.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-base text-destructive">
              Flags ({flags.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {flags.map((f) => (
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

      {recordings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recordings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recordings.map((r) => (
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
        {questions.map((q) => {
          const answer = answers.find((a) => a.questionId === q.id);
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
                  candidateId={candidate.id}
                  interviewId={params.id}
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
