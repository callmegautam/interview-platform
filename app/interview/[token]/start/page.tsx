import { notFound, redirect } from "next/navigation";
import { validateInterviewToken, getInterviewQuestionsByToken } from "@/lib/actions/interview-take";
import { InterviewRoom } from "./interview-room";

export default async function InterviewStartPage(props: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ webcam?: string }>;
}) {
  const [{ token }, { webcam }] = await Promise.all([
    props.params,
    props.searchParams,
  ]);

  const [data, questions] = await Promise.all([
    validateInterviewToken(token),
    getInterviewQuestionsByToken(token),
  ]);

  if (!data) notFound();
  if (data.status === "pending") redirect(`/interview/${token}`);
  if (data.status === "completed") {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <p className="text-lg">Interview already submitted. Thank you!</p>
      </div>
    );
  }

  return (
    <InterviewRoom
      token={token}
      candidateName={data.name}
      timeLimitMinutes={data.interview.timeLimitMinutes}
      questions={questions}
      webcamEnabled={webcam === "true"}
    />
  );
}
