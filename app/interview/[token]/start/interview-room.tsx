"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MonacoEditor } from "@/components/editor/MonacoEditor";
import { Timer } from "@/components/interview/Timer";
import { TabMonitor } from "@/components/interview/TabMonitor";

interface Question {
  id: string;
  title: string;
  description: string;
  type: "code" | "text";
  language: string | null;
  codeStarter: string | null;
  order: number;
}

export function InterviewRoom({
  token,
  candidateName,
  timeLimitMinutes,
  questions,
  webcamEnabled,
}: {
  token: string;
  candidateName: string;
  timeLimitMinutes: number;
  questions: Question[];
  webcamEnabled: boolean;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, { text: string; code: string }>>({});
  const [screenBlob, setScreenBlob] = useState<Blob | null>(null);
  const [webcamBlob, setWebcamBlob] = useState<Blob | null>(null);

  const screenStreamRef = useRef<MediaStream | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const screenRecorderRef = useRef<MediaRecorder | null>(null);
  const webcamRecorderRef = useRef<MediaRecorder | null>(null);
  const screenChunksRef = useRef<Blob[]>([]);
  const webcamChunksRef = useRef<Blob[]>([]);
  const screenReadyRef = useRef(false);
  const webcamReadyRef = useRef(false);

  const startScreenRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      screenStreamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : "video/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      screenRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          screenChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(screenChunksRef.current, { type: "video/webm" });
        setScreenBlob(blob);
        screenChunksRef.current = [];
      };

      recorder.start(5000);
      screenReadyRef.current = true;
    } catch {
      alert("Screen recording is required for this interview. Please allow screen sharing.");
    }
  }, []);

  const webcamVideoRef = useRef<HTMLVideoElement>(null);

  const startWebcamRecording = useCallback(async () => {
    if (!webcamEnabled) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      webcamStreamRef.current = stream;

      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
      }

      const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      webcamRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          webcamChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(webcamChunksRef.current, { type: "video/webm" });
        setWebcamBlob(blob);
        webcamChunksRef.current = [];
      };

      recorder.start(5000);
      webcamReadyRef.current = true;
    } catch {
      // Silently fail — webcam is optional
    }
  }, [webcamEnabled]);

  useEffect(() => {
    startScreenRecording();
    if (webcamEnabled) startWebcamRecording();
  }, [startScreenRecording, startWebcamRecording, webcamEnabled]);

  const updateAnswer = (questionId: string, field: "text" | "code", value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        text: field === "text" ? value : (prev[questionId]?.text ?? ""),
        code: field === "code" ? value : (prev[questionId]?.code ?? ""),
      },
    }));
  };

  async function uploadRecording(blob: Blob, candidateId: string, type: string) {
    const formData = new FormData();
    formData.append("file", blob, `${candidateId}-${type}.webm`);
    formData.append("candidateId", candidateId);
    formData.append("type", type);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    return data.path as string;
  }

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    screenRecorderRef.current?.stop();
    webcamRecorderRef.current?.stop();

    // Wait a tick for onstop events to fire
    await new Promise((r) => setTimeout(r, 500));

    const answersData = questions
      .filter((q) => answers[q.id]?.text || answers[q.id]?.code)
      .map((q) => ({
        questionId: q.id,
        answerText: q.type === "text" ? answers[q.id]?.text : undefined,
        code: q.type === "code" ? answers[q.id]?.code : undefined,
        language: q.type === "code" ? q.language ?? "javascript" : undefined,
      }));

    try {
      const res = await fetch(`/api/interview/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answersData }),
      });
      const result = await res.json();
      const candidateId = result.candidateId as string;

      if (screenBlob) {
        const path = await uploadRecording(screenBlob, candidateId, "screen");
        if (path) {
          await fetch(`/api/interview/${token}/recordings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "screen", storagePath: path, fileSize: screenBlob.size }),
          });
        }
      }

      if (webcamBlob) {
        const path = await uploadRecording(webcamBlob, candidateId, "webcam");
        if (path) {
          await fetch(`/api/interview/${token}/recordings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "webcam", storagePath: path, fileSize: webcamBlob.size }),
          });
        }
      }
    } catch (err) {
      console.error("Failed to submit:", err);
    }

    setSubmitted(true);
  }, [submitting, token, questions, answers, screenBlob, webcamBlob]);

  const handleTimeUp = useCallback(() => {
    handleSubmit();
  }, [handleSubmit]);

  if (submitted) {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle>Interview submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Thank you, {candidateName}! Your interview has been submitted successfully.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allQuestionsAnswered = questions.every(
    (q) => answers[q.id]?.text || answers[q.id]?.code
  );

  return (
    <div className="flex min-h-svh flex-col">
      <TabMonitor token={token} />

      {webcamEnabled && (
        <video
          ref={webcamVideoRef}
          autoPlay
          muted
          className="fixed bottom-4 right-4 z-50 w-48 rounded-lg border shadow-lg"
        />
      )}

      <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-background px-6 py-3">
        <div>
          <p className="text-sm font-medium">{candidateName}</p>
        </div>
        <Timer minutes={timeLimitMinutes} onTimeUp={handleTimeUp} />
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          variant={allQuestionsAnswered ? "default" : "outline"}
        >
          {submitting ? "Submitting..." : "Submit interview"}
        </Button>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 p-6">
        {questions.map((q, idx) => (
          <Card key={q.id} id={`question-${q.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {idx + 1}. {q.title}
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                    {q.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {q.type === "code" ? (
                <MonacoEditor
                  language={q.language ?? "javascript"}
                  value={answers[q.id]?.code ?? q.codeStarter ?? ""}
                  onChange={(v) => updateAnswer(q.id, "code", v)}
                  height="300px"
                />
              ) : (
                <textarea
                  className="min-h-[150px] w-full rounded-md border bg-background p-3 text-sm"
                  placeholder="Type your answer here..."
                  value={answers[q.id]?.text ?? ""}
                  onChange={(e) => updateAnswer(q.id, "text", e.target.value)}
                />
              )}
            </CardContent>
          </Card>
        ))}

        <Separator />

        <div className="flex justify-center pb-8">
          <Button onClick={handleSubmit} disabled={submitting} size="lg">
            {submitting ? "Submitting..." : "Submit interview"}
          </Button>
        </div>
      </main>
    </div>
  );
}
