"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { InterviewRoom } from "./interview-room";

interface Question {
  id: string;
  title: string;
  description: string;
  type: "code" | "text";
  language: string | null;
  codeStarter: string | null;
  order: number;
}

interface InterviewData {
  candidate: { name: string; email: string; status: string };
  interview: { id: string; title: string; description: string; timeLimitMinutes: number };
  questions: Question[];
}

export default function InterviewStartPage() {
  const params = useParams<{ token: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const webcam = searchParams.get("webcam");

  const [data, setData] = useState<InterviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/interview/${params.token}`);
        if (!res.ok) {
          router.push(`/interview/${params.token}`);
          return;
        }
        const json = await res.json();
        if (json.candidate.status === "pending") {
          router.push(`/interview/${params.token}`);
          return;
        }
        setData(json);
      } catch {
        router.push(`/interview/${params.token}`);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.token, router]);

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <p className="text-lg">Loading interview...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <p className="text-lg">Interview not found.</p>
      </div>
    );
  }

  if (data.candidate.status === "completed") {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <p className="text-lg">Interview already submitted. Thank you!</p>
      </div>
    );
  }

  return (
    <InterviewRoom
      token={params.token}
      candidateName={data.candidate.name}
      timeLimitMinutes={data.interview.timeLimitMinutes}
      questions={data.questions}
      webcamEnabled={webcam === "true"}
    />
  );
}
