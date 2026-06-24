import { QuestionForm } from "./question-form";

export default function NewQuestionPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create question</h1>
        <p className="text-sm text-muted-foreground">
          Add a new question to your library
        </p>
      </div>
      <QuestionForm />
    </div>
  );
}
