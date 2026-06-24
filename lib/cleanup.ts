"use server";

import { getDb, getSupabaseAdmin } from "@/lib/db";
import { recordings } from "@/lib/db/schema";
import { lt, eq } from "drizzle-orm";

export async function cleanupExpiredRecordings() {
  const { db, error } = getDb();
  if (!db) {
    console.error("Cleanup skipped:", error);
    return 0;
  }

  try {
    const expired = await db
      .select({ id: recordings.id, storagePath: recordings.storagePath })
      .from(recordings)
      .where(lt(recordings.expiresAt, new Date()));

    if (expired.length === 0) return 0;

    const paths = expired.map((r) => r.storagePath);
    const ids = expired.map((r) => r.id);

    const { supabase } = getSupabaseAdmin();
    if (supabase) {
      const { error: storageError } = await supabase.storage.from("recordings").remove(paths);
      if (storageError) {
        console.error("Failed to delete expired recordings from storage:", storageError);
      }
    }

    for (const id of ids) {
      await db.delete(recordings).where(eq(recordings.id, id));
    }

    return expired.length;
  } catch (err) {
    console.error("Cleanup failed:", err);
    return 0;
  }
}
