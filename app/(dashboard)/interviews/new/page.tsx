"use client";

import { useEffect, useState } from "react";
import { InterviewForm } from "./interview-form";
import { Card, CardContent } from "@/components/ui/card";
import { apiGet } from "@/lib/api-client";

interface Question {
  id: string;
  title: string;
  type: "code" | "text";
  language: string | null;
}

export default function NewInterviewPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ questions: Question[] }>("/api/questions")
      .then((res) => setQuestions(res.questions))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create interview</h1>
          <p className="text-sm text-muted-foreground">
            Set up a new interview with questions and candidate details
          </p>
        </div>
        <p className="text-sm text-muted-foreground">Loading questions...</p>
      </div>
    );
  }

  if (error) {
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
            {error}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create interview</h1>
        <p className="text-sm text-muted-foreground">
          Set up a new interview with questions and candidate details
        </p>
      </div>
      <InterviewForm questions={questions} />
    </div>
  );
}
