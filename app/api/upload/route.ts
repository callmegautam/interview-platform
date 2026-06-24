import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const candidateId = formData.get("candidateId") as string;
    const type = formData.get("type") as string;

    if (!file || !candidateId || !type) {
      return NextResponse.json({ error: "Missing file, candidateId, or type" }, { status: 400 });
    }

    const { supabase, error: initError } = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: initError || "Storage service is not available" },
        { status: 503 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const fileName = `${candidateId}/${type}-${Date.now()}.webm`;

    const { data, error } = await supabase.storage
      .from("recordings")
      .upload(fileName, buffer, {
        contentType: file.type || "video/webm",
        upsert: true,
      });

    if (error) {
      console.error("Upload error:", error);
      return NextResponse.json({ error: "Storage upload failed" }, { status: 500 });
    }

    return NextResponse.json({ path: data.path });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
