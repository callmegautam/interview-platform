"use client";

import { useEffect } from "react";

export function TabMonitor({ token }: { token: string }) {
  useEffect(() => {
    const sendFlag = async (type: string) => {
      try {
        await fetch(`/api/interview/${token}/flag`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        });
      } catch {
        // silently fail — best effort
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        sendFlag("tab_switch");
      }
    };

    const handleBlur = () => {
      sendFlag("app_switch");
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
    };
  }, [token]);

  return null;
}
