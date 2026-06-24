import { notFound, redirect } from "next/navigation";
import { validateInterviewToken } from "@/lib/actions/interview-take";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InstructionsForm } from "./instructions-form";

export default async function InterviewInstructionsPage(props: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await props.params;
  const data = await validateInterviewToken(token);

  if (!data) notFound();

  if (data.status === "completed") {
    return (
      <div className="flex min-h-svh items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle>Interview already completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You have already completed this interview. Thank you!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (data.status === "in_progress") {
    redirect(`/interview/${token}/start`);
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-xl">{data.interview.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {data.interview.description}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Time limit</span>
              <p className="font-medium">{data.interview.timeLimitMinutes} minutes</p>
            </div>
            <div>
              <span className="text-muted-foreground">Candidate</span>
              <p className="font-medium">{data.name}</p>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
            <h3 className="text-sm font-medium">Before you start</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Screen recording is <strong>required</strong> — you will be prompted to share your screen</li>
              <li>• Webcam recording is <strong>optional</strong> — you can choose to enable it</li>
              <li>• Do not switch tabs or open other applications during the interview</li>
              <li>• Your answers are auto-saved when you submit</li>
              <li>• The interview will auto-submit when time runs out</li>
            </ul>
          </div>

          <InstructionsForm token={token} />
        </CardContent>
      </Card>
    </div>
  );
}
