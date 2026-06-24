"use client";

import { useRef, useCallback, useEffect } from "react";

export function ScreenRecorder({
  token,
  onReady,
  onError,
}: {
  token: string;
  onReady: () => void;
  onError: (error: string) => void;
}) {
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : "video/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.start(5000);
      onReady();
    } catch (err) {
      onError("Screen recording permission was denied or failed.");
    }
  }, [onReady, onError]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!recorderRef.current || recorderRef.current.state === "inactive") {
        resolve(null);
        return;
      }

      recorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        chunksRef.current = [];
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }
        resolve(blob);
      };

      recorderRef.current.stop();
    });
  }, []);

  useEffect(() => {
    startRecording();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [startRecording]);

  return null;
}
