"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { startInterview } from "@/lib/actions/interview-take";

export function InstructionsForm({ token }: { token: string }) {
  const [screenConsent, setScreenConsent] = useState(false);
  const [webcamConsent, setWebcamConsent] = useState(false);
  const [policyConsent, setPolicyConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const canStart = screenConsent && policyConsent;

  const handleStart = async () => {
    setLoading(true);
    try {
      await startInterview(token);
      const params = new URLSearchParams();
      if (webcamConsent) params.set("webcam", "true");
      router.push(`/interview/${token}/start?${params.toString()}`);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Checkbox
          id="screen-consent"
          checked={screenConsent}
          onCheckedChange={(v) => setScreenConsent(v === true)}
        />
        <Label htmlFor="screen-consent" className="text-sm leading-5">
          I consent to <strong>screen recording</strong> for the duration of this interview
        </Label>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="webcam-consent"
          checked={webcamConsent}
          onCheckedChange={(v) => setWebcamConsent(v === true)}
        />
        <Label htmlFor="webcam-consent" className="text-sm leading-5">
          I consent to <strong>webcam recording</strong> (optional)
        </Label>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="policy-consent"
          checked={policyConsent}
          onCheckedChange={(v) => setPolicyConsent(v === true)}
        />
        <Label htmlFor="policy-consent" className="text-sm leading-5">
          I understand that switching tabs or opening other applications will be flagged
        </Label>
      </div>

      <Button
        className="w-full"
        disabled={!canStart || loading}
        onClick={handleStart}
      >
        {loading ? "Starting..." : "Start interview"}
      </Button>
    </div>
  );
}
