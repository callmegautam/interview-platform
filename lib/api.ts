import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decrypt, type SessionPayload } from "./auth/session";
import { getDb, type Database } from "./db";

export async function getSession(): Promise<SessionPayload | null> {
  const cookie = (await cookies()).get("session")?.value;
  return decrypt(cookie);
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(err: unknown) {
  console.error(err);
  return NextResponse.json(
    { error: err instanceof Error ? err.message : "Internal server error" },
    { status: 500 }
  );
}

export function requireDb(): Database {
  const { db, error } = getDb();
  if (!db) throw new Error(error || "Database is not available");
  return db;
}
