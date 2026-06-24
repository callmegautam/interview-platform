"use client";

import { Button } from "@/components/ui/button";
import { deleteQuestion } from "@/lib/actions/questions";
import { Trash2 } from "lucide-react";

export function DeleteButton({ questionId }: { questionId: string }) {
  return (
    <form action={deleteQuestion.bind(null, questionId)}>
      <Button variant="ghost" size="icon" className="text-destructive">
        <Trash2 className="size-4" />
      </Button>
    </form>
  );
}
