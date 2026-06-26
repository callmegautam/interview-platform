"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
import { apiGet } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

interface Interview {
  id: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  status: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  status: string;
  completedAt: string | null;
}

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [candidatesList, setCandidatesList] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [interviewRes, candidatesRes] = await Promise.all([
          apiGet<{ interview: Interview }>(`/api/interviews/${params.id}`),
          apiGet<{ candidates: Candidate[] }>(`/api/interviews/${params.id}/candidates`),
        ]);
        setInterview(interviewRes.interview);
        setCandidatesList(candidatesRes.candidates);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  if (!interview) {
    return <p className="text-destructive">Interview not found</p>;
  }

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
                  <Link href={`/interviews/${params.id}/candidates/${c.id}`}>
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
