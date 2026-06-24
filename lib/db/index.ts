import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

let _db: Database | null = null;
let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

function getOrInit<T>(label: string, init: () => T): T {
  const errMsg = (e: unknown) =>
    `Cannot connect to ${label}: ${e instanceof Error ? e.message : "Unknown error"}`;
  try {
    return init();
  } catch (err) {
    const msg = errMsg(err);
    console.error(msg);
    throw new Error(msg);
  }
}

export function getDb(): { db: Database | null; error: string | null } {
  try {
    if (!_db) {
      _db = getOrInit("Postgres", () => {
        const url = process.env.DATABASE_URL;
        if (!url) throw new Error("DATABASE_URL is not set");
        const client = postgres(url, {
          max: 3,
          idle_timeout: 10,
          connect_timeout: 15,
          ssl: url.includes("sslmode=require") ? "require" : undefined,
        });
        return drizzle(client, { schema });
      });
    }
    return { db: _db, error: null };
  } catch (err) {
    return { db: null, error: err instanceof Error ? err.message : "Database unavailable" };
  }
}

export function getSupabase(): { supabase: SupabaseClient | null; error: string | null } {
  try {
    if (!_supabase) {
      _supabase = getOrInit("Supabase", () => {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_ANON_KEY;
        if (!url || !key) throw new Error("SUPABASE_URL or SUPABASE_ANON_KEY is not set");
        return createClient(url, key);
      });
    }
    return { supabase: _supabase, error: null };
  } catch (err) {
    return { supabase: null, error: err instanceof Error ? err.message : "Supabase unavailable" };
  }
}

export function getSupabaseAdmin(): { supabase: SupabaseClient | null; error: string | null } {
  try {
    if (!_supabaseAdmin) {
      _supabaseAdmin = getOrInit("Supabase Admin", () => {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
        return createClient(url, key);
      });
    }
    return { supabase: _supabaseAdmin, error: null };
  } catch (err) {
    return { supabase: null, error: err instanceof Error ? err.message : "Supabase unavailable" };
  }
}

export function isDbAvailable(): boolean {
  const { db } = getDb();
  return db !== null;
}
