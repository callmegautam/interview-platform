"use client";

import { Button } from "@/components/ui/button";
import { markCandidate } from "@/lib/actions/scoring";
import { useRouter } from "next/navigation";

export function MarkForm({
  candidateId,
  currentStatus,
}: {
  candidateId: string;
  currentStatus: string;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Mark as:</span>
      <form
        action={async () => {
          await markCandidate(candidateId, "passed");
          router.refresh();
        }}
      >
        <Button
          type="submit"
          variant={currentStatus === "passed" ? "default" : "outline"}
          size="sm"
          disabled={currentStatus === "passed"}
        >
          Pass
        </Button>
      </form>
      <form
        action={async () => {
          await markCandidate(candidateId, "failed");
          router.refresh();
        }}
      >
        <Button
          type="submit"
          variant={currentStatus === "failed" ? "destructive" : "outline"}
          size="sm"
          disabled={currentStatus === "failed"}
        >
          Fail
        </Button>
      </form>
    </div>
  );
}
