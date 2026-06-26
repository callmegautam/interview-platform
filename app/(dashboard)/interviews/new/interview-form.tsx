"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiPost } from "@/lib/api-client";

interface Question {
  id: string;
  title: string;
  type: "code" | "text";
  language: string | null;
}

export function InterviewForm({ questions }: { questions: Question[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const questionIds = form.getAll("questionIds").map(String);

    try {
      const res = await apiPost<{ interview: { id: string } }>("/api/interviews", {
        title: form.get("title"),
        description: form.get("description"),
        timeLimitMinutes: form.get("timeLimitMinutes"),
        questionIds,
        candidateName: form.get("candidateName"),
        candidateEmail: form.get("candidateEmail"),
        candidatePhone: form.get("candidatePhone") || undefined,
      });
      router.push(`/interviews/${res.interview.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create interview");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Interview details</h2>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" placeholder="Senior Frontend Interview" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" placeholder="Brief description..." rows={3} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timeLimitMinutes">Time limit (minutes)</Label>
          <Input id="timeLimitMinutes" name="timeLimitMinutes" type="number" min={1} defaultValue={60} required />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Select questions</h2>
        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No questions available. Create questions first.
          </p>
        ) : (
          <ScrollArea className="h-64 rounded-md border">
            <div className="space-y-2 p-4">
              {questions.map((q) => (
                <label key={q.id} className="flex items-start gap-3 rounded-md p-2 hover:bg-muted cursor-pointer">
                  <Checkbox name="questionIds" value={q.id} />
                  <div>
                    <p className="text-sm font-medium">{q.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {q.type}{q.language ? ` · ${q.language}` : ""}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Candidate details</h2>
        <div className="space-y-2">
          <Label htmlFor="candidateName">Name</Label>
          <Input id="candidateName" name="candidateName" placeholder="John Doe" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="candidateEmail">Email</Label>
          <Input id="candidateEmail" name="candidateEmail" type="email" placeholder="john@example.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="candidatePhone">Phone (optional)</Label>
          <Input id="candidatePhone" name="candidatePhone" placeholder="+1 555-0000" />
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create interview"}
      </Button>
    </form>
  );
}
