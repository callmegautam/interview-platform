"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { saveScore } from "@/lib/actions/scoring";
import { toast } from "sonner";
import { useEffect } from "react";

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
  const [state, action, pending] = useActionState(saveScore, undefined);

  useEffect(() => {
    if (state?.success) {
      toast.success("Score saved");
    }
  }, [state]);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="questionId" value={questionId} />
      <input type="hidden" name="candidateId" value={candidateId} />
      <input type="hidden" name="interviewId" value={interviewId} />

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

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}
