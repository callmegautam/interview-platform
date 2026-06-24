import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getInterview, getInterviewCandidates } from "@/lib/actions/interviews";
import { formatDate } from "@/lib/utils";

export default async function ResultsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [interview, candidatesList] = await Promise.all([
    getInterview(id),
    getInterviewCandidates(id),
  ]);

  if (!interview) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{interview.title} — Results</h1>
        <p className="text-sm text-muted-foreground">Review and score candidate submissions</p>
      </div>

      {candidatesList.length === 0 ? (
        <p className="text-sm text-muted-foreground">No candidates yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidatesList.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      c.status === "completed" || c.status === "passed" ? "default" :
                      c.status === "failed" ? "destructive" : "secondary"
                    }
                  >
                    {c.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {c.completedAt ? formatDate(c.completedAt) : "—"}
                </TableCell>
                <TableCell>
                  <Link href={`/interviews/${id}/candidates/${c.id}`}>
                    <Button variant="ghost" size="sm">Review</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
