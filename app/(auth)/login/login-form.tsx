"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { login } from "@/lib/auth/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="m@example.com" required />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
        </div>
        <Input id="password" name="password" type="password" required />
      </div>
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
          Sign up
        </Link>
      </p>
    </form>
  );
}
