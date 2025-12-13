import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { VSCodeApiType } from "../types";

// VS Code API
declare const acquireVsCodeApi: () => VSCodeApiType;

function useTextSync() {
  const [text, setText] = useState<string>(window.initialData?.text ?? "");
  const [vscodeApi] = useState(() => acquireVsCodeApi());
  const lastSentTextRef = useRef<string>(window.initialData?.text ?? "");

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      switch (message.type) {
        case "update":
          if (message.text !== lastSentTextRef.current) {
            setText(message.text);
            lastSentTextRef.current = message.text;
          }
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const setTextImmediate = useCallback(
    (newText: string) => {
      setText(newText);
      lastSentTextRef.current = newText;
      vscodeApi.postMessage({ type: "update", text: newText });
    },
    [vscodeApi]
  );

  return { text, setTextImmediate, lastSentTextRef } as const;
}

type TextContextValue = ReturnType<typeof useTextSync>;

const TextContext = createContext<TextContextValue | undefined>(undefined);

export const TextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useTextSync();
  return <TextContext.Provider value={value}>{children}</TextContext.Provider>;
};

export function useText() {
  const ctx = useContext(TextContext);
  if (!ctx) throw new Error("useText must be used within a TextProvider");
  return ctx;
}
