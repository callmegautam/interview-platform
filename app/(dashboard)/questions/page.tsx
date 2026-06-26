"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiGet } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import { DeleteButton } from "./delete-button";

interface Question {
  id: string;
  title: string;
  type: string;
  language: string | null;
  createdAt: string;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  function loadQuestions() {
    apiGet<{ questions: Question[] }>("/api/questions")
      .then((res) => setQuestions(res.questions))
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(loadQuestions, []);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Questions</h1>
          <p className="text-sm text-muted-foreground">
            Manage your interview questions
          </p>
        </div>
        <Link href="/questions/new">
          <Button>Create question</Button>
        </Link>
      </div>

      {questions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-lg font-medium">No questions yet</p>
          <p className="text-sm text-muted-foreground">
            Create your first question to get started.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((q) => (
              <TableRow key={q.id}>
                <TableCell className="font-medium">{q.title}</TableCell>
                <TableCell>
                  <Badge variant={q.type === "code" ? "default" : "secondary"}>
                    {q.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {q.language ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(q.createdAt)}
                </TableCell>
                <TableCell>
                  <DeleteButton questionId={q.id} onDeleted={loadQuestions} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
