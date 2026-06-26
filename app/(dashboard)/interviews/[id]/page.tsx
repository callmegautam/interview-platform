"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiGet } from "@/lib/api-client";
import { formatDate, getInterviewUrl } from "@/lib/utils";
import { CopyButton } from "./copy-button";

interface Interview {
  id: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  status: string;
  createdAt: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  token: string;
}

interface InterviewQuestion {
  questionId: string;
  order: number;
  title: string;
  type: string;
  language: string | null;
}

export default function InterviewDetailPage() {
  const params = useParams<{ id: string }>();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [candidatesList, setCandidatesList] = useState<Candidate[]>([]);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [interviewRes, candidatesRes, questionsRes] = await Promise.all([
          apiGet<{ interview: Interview }>(`/api/interviews/${params.id}`),
          apiGet<{ candidates: Candidate[] }>(`/api/interviews/${params.id}/candidates`),
          apiGet<{ questions: InterviewQuestion[] }>(`/api/interviews/${params.id}/questions`),
        ]);
        setInterview(interviewRes.interview);
        setCandidatesList(candidatesRes.candidates);
        setQuestions(questionsRes.questions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  if (!interview) {
    return <p className="text-destructive">Interview not found</p>;
  }

  const firstCandidate = candidatesList[0];
  const inviteUrl = firstCandidate ? getInterviewUrl(firstCandidate.token) : "";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{interview.title}</h1>
          <p className="text-muted-foreground">{interview.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={interview.status === "active" ? "default" : "secondary"}>
            {interview.status}
          </Badge>
          <span className="text-sm text-muted-foreground">{interview.timeLimitMinutes} minutes</span>
        </div>
      </div>

      <Separator />

      {firstCandidate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invite link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm">
                {inviteUrl}
              </code>
              <CopyButton text={inviteUrl} />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Questions ({questions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-inside list-decimal space-y-1 text-sm">
            {questions.map((q) => (
              <li key={q.questionId}>
                {q.title}
                <Badge variant="outline" className="ml-2 text-xs">
                  {q.type}
                </Badge>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">Candidates</h2>
          <Link href={`/interviews/${params.id}/results`}>
            <Button variant="outline" size="sm">View results</Button>
          </Link>
        </div>

        {candidatesList.length === 0 ? (
          <p className="text-sm text-muted-foreground">No candidates yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidatesList.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        c.status === "completed" ? "default" :
                        c.status === "in_progress" ? "secondary" :
                        c.status === "passed" ? "default" :
                        c.status === "failed" ? "destructive" :
                        "outline"
                      }
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {c.startedAt ? formatDate(c.startedAt) : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {c.completedAt ? formatDate(c.completedAt) : "—"}
                  </TableCell>
                  <TableCell>
                    <Link href={`/interviews/${params.id}/candidates/${c.id}`}>
                      <Button variant="ghost" size="sm">Review</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
