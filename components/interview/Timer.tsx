"use client";

import { useEffect, useState } from "react";

export function Timer({
  minutes,
  onTimeUp,
}: {
  minutes: number;
  onTimeUp: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);
  const [warning, setWarning] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp();
      return;
    }

    if (secondsLeft <= 300 && !warning) {
      setWarning(true);
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onTimeUp, warning]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div
      className={`text-2xl font-bold tabular-nums ${
        warning ? "text-destructive animate-pulse" : "text-foreground"
      }`}
    >
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </div>
  );
}
