import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your details to create your company account
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
