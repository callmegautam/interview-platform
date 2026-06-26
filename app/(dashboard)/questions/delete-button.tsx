"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { apiDelete } from "@/lib/api-client";

export function DeleteButton({ questionId, onDeleted }: { questionId: string; onDeleted: () => void }) {
  async function handleDelete() {
    try {
      await apiDelete(`/api/questions/${questionId}`);
      onDeleted();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Button variant="ghost" size="icon" className="text-destructive" onClick={handleDelete}>
      <Trash2 className="size-4" />
    </Button>
  );
}
