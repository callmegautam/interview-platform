"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiGet } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

interface Interview {
  id: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  status: string;
  createdAt: string;
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ interviews: Interview[] }>("/api/interviews")
      .then((res) => setInterviews(res.interviews))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="space-y-6"><p className="text-sm text-muted-foreground">Loading...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Interviews</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage your interviews
          </p>
        </div>
        <Link href="/interviews/new">
          <Button>Create interview</Button>
        </Link>
      </div>

      {interviews.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-lg font-medium">No interviews yet</p>
          <p className="text-sm text-muted-foreground">
            Create your first interview to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {interviews.map((interview) => (
            <Link key={interview.id} href={`/interviews/${interview.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">{interview.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant={interview.status === "active" ? "default" : "secondary"}>
                      {interview.status}
                    </Badge>
                    <span>{interview.timeLimitMinutes} min</span>
                    <span>{formatDate(interview.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
