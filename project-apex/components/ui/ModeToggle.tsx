"use client";
import { useState } from "react";
import { Atom, MessageSquare } from "lucide-react";
import { cn } from "./cn";

export type Mode = "chat" | "agent";

export function ModeToggle({
  value,
  onChange,
}: {
  value?: Mode;
  onChange?: (m: Mode) => void;
}) {
  const [mode, setMode] = useState<Mode>(value ?? "chat");
  const isAgent = mode === "agent";

  return (
    <button
      aria-label="Toggle mode"
      onClick={() => {
        const next = isAgent ? "chat" : "agent";
        setMode(next);
        onChange?.(next);
      }}
      className={cn(
        "relative inline-flex items-center gap-2 rounded-full border px-2 py-1",
        "border-black/10 dark:border-white/15 bg-white/60 dark:bg-white/5 backdrop-blur",
        "transition-colors"
      )}
    >
      <span
        className={cn(
          "absolute top-0 bottom-0 my-auto h-7 w-7 rounded-full transition-transform",
          isAgent ? "translate-x-[38px] bg-orange-500/20" : "translate-x-[2px] bg-black/10 dark:bg-white/10"
        )}
      />
      <span className="relative z-10 flex items-center gap-1 text-xs">
        <MessageSquare className={cn("h-4 w-4", !isAgent ? "text-black dark:text-white" : "opacity-50")}/>
        Chat
      </span>
      <span className="relative z-10 flex items-center gap-1 text-xs pl-4">
        <Atom className={cn("h-4 w-4", isAgent ? "text-orange-500" : "opacity-50")}/>
        Agent
      </span>
    </button>
  );
}

