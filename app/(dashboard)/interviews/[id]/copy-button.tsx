"use client";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export function CopyButton({ text }: { text: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        navigator.clipboard.writeText(text);
        toast.success("Link copied to clipboard");
      }}
    >
      <Copy className="mr-2 size-3" />
      Copy
    </Button>
  );
}
