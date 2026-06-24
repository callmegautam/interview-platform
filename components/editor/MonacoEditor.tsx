"use client";

import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export function MonacoEditor({
  value,
  onChange,
  language = "javascript",
  height = "300px",
}: {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
}) {
  return (
    <Editor
      height={height}
      language={language}
      value={value}
      onChange={(v) => onChange(v ?? "")}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  );
}
