"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiPost } from "@/lib/api-client";
import { toast } from "sonner";

export function ScoreForm({
  questionId,
  candidateId,
  interviewId,
  currentScore,
  currentFeedback,
}: {
  questionId: string;
  candidateId: string;
  interviewId: string;
  currentScore: number | null;
  currentFeedback: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    try {
      await apiPost(`/api/interviews/${interviewId}/candidates/${candidateId}/scores`, {
        questionId: form.get("questionId"),
        score: form.get("score"),
        feedback: form.get("feedback") || undefined,
      });
      toast.success("Score saved");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save score");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input type="hidden" name="questionId" value={questionId} />

      <div className="flex items-end gap-4">
        <div className="space-y-1">
          <Label htmlFor={`score-${questionId}`}>Score (0–10)</Label>
          <Input
            id={`score-${questionId}`}
            name="score"
            type="number"
            min={0}
            max={10}
            defaultValue={currentScore ?? undefined}
            className="w-24"
            required
          />
        </div>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving..." : currentScore ? "Update" : "Save"}
        </Button>
      </div>

      <div className="space-y-1">
        <Label htmlFor={`feedback-${questionId}`}>Feedback (optional)</Label>
        <Textarea
          id={`feedback-${questionId}`}
          name="feedback"
          defaultValue={currentFeedback ?? ""}
          rows={2}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </form>
  );
}
