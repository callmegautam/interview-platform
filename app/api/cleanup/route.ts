import { NextResponse } from "next/server";
import { cleanupExpiredRecordings } from "@/lib/cleanup";

export async function GET() {
  try {
    const count = await cleanupExpiredRecordings();
    return NextResponse.json({ cleaned: count });
  } catch (err) {
    console.error("Cleanup error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Cleanup failed" },
      { status: 500 }
    );
  }
}
