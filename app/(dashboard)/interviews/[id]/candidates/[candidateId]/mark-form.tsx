"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/api-client";

export function MarkForm({
  candidateId,
  currentStatus,
  interviewId,
}: {
  candidateId: string;
  currentStatus: string;
  interviewId: string;
}) {
  const router = useRouter();

  async function handleMark(status: "passed" | "failed") {
    try {
      await apiPost(`/api/interviews/${interviewId}/candidates/${candidateId}/mark`, { status });
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Mark as:</span>
      <Button
        variant={currentStatus === "passed" ? "default" : "outline"}
        size="sm"
        disabled={currentStatus === "passed"}
        onClick={() => handleMark("passed")}
      >
        Pass
      </Button>
      <Button
        variant={currentStatus === "failed" ? "destructive" : "outline"}
        size="sm"
        disabled={currentStatus === "failed"}
        onClick={() => handleMark("failed")}
      >
        Fail
      </Button>
    </div>
  );
}
