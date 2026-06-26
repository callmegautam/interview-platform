"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiGet } from "@/lib/api-client";

interface Company {
  id: string;
  name: string;
  email: string;
}

export default function SettingsPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        setCompany(json.company);
        // We don't expose userId from the API, but we can get it from the company data
        if (json.company) setSessionUserId(json.company.id);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Your company profile</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">Company name</span>
            <p className="font-medium">{company?.name ?? "Unknown"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Email</span>
            <p className="font-medium">{company?.email ?? "Unknown"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Account ID</span>
            <p className="font-mono text-xs">{sessionUserId ?? "Unknown"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
