"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createQuestion } from "@/lib/actions/questions";

const languages = [
  "javascript", "typescript", "python", "java", "cpp", "go", "rust", "ruby", "sql", "bash",
];

export function QuestionForm() {
  const [state, action, pending] = useActionState(createQuestion, undefined);
  const [type, setType] = useState("text");

  return (
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="Reverse a linked list" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Write the question description here..."
          rows={5}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Answer type</Label>
        <Select name="type" defaultValue="text" onValueChange={(v) => v && setType(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text answer</SelectItem>
            <SelectItem value="code">Code answer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {type === "code" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select name="language" defaultValue="javascript">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="codeStarter">Starter code (optional)</Label>
            <Textarea
              id="codeStarter"
              name="codeStarter"
              placeholder="function solve() { ... }"
              rows={8}
              className="font-mono text-sm"
            />
          </div>
        </>
      )}

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create question"}
      </Button>
    </form>
  );
}
