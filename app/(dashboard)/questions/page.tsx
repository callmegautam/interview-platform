import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getQuestions, deleteQuestion } from "@/lib/actions/questions";
import { formatDate } from "@/lib/utils";
import { DeleteButton } from "./delete-button";

export default async function QuestionsPage() {
  const questionsList = await getQuestions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Questions</h1>
          <p className="text-sm text-muted-foreground">
            Manage your interview questions
          </p>
        </div>
        <Link href="/questions/new">
          <Button>Create question</Button>
        </Link>
      </div>

      {questionsList.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-lg font-medium">No questions yet</p>
          <p className="text-sm text-muted-foreground">
            Create your first question to get started.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {questionsList.map((q) => (
              <TableRow key={q.id}>
                <TableCell className="font-medium">{q.title}</TableCell>
                <TableCell>
                  <Badge variant={q.type === "code" ? "default" : "secondary"}>
                    {q.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {q.language ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(q.createdAt)}
                </TableCell>
                <TableCell>
                  <DeleteButton questionId={q.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
