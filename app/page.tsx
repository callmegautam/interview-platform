import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-xl font-bold">Kaizen Interviews</span>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button>Get started</Button>
          </Link>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Code interviews, made simple
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Create coding interviews with real-time code editors, screen recording, and automated proctoring.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/signup">
            <Button size="lg">Create your account</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">Sign in</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
