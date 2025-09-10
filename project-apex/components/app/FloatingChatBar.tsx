"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Atom, MessageSquare, Mic, Paperclip, Send } from "lucide-react";
import { cn } from "@/components/ui/cn";
import { Mode, ModeToggle } from "@/components/ui/ModeToggle";

export default function FloatingChatBar({
  mode,
  onToggleMode,
  onSend,
}: {
  mode: Mode;
  onToggleMode: (m: Mode) => void;
  onSend: (text: string) => void;
}) {
  const [value, setValue] = useState("");

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed inset-x-0 bottom-4 z-20 flex justify-center px-4"
    >
      <div
        className={cn(
          "w-full max-w-3xl rounded-2xl border border-black/10 dark:border-white/10",
          "bg-white/70 dark:bg-white/5 backdrop-blur shadow-lg",
          "px-3 py-2 flex items-center gap-2"
        )}
      >
        {/* Mode switch inside the bar */}
        <ModeToggle value={mode} onChange={onToggleMode} />

        <div className="flex-1 flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-black/5" aria-label="Attach">
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            className="flex-1 rounded-full px-4 py-2 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-300"
            placeholder={mode === "agent" ? "Décrivez la tâche à exécuter…" : "Écrire un message…"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (value.trim()) {
                  onSend(value.trim());
                  setValue("");
                }
              }
            }}
          />
          <button className="p-2 rounded-full hover:bg-black/5" aria-label="Mic">
            <Mic className="h-4 w-4" />
          </button>
          <button
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-2 border",
              "border-black/10 dark:border-white/10 hover:bg-amber-500/10"
            )}
            onClick={() => {
              if (value.trim()) {
                onSend(value.trim());
                setValue("");
              }
            }}
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Envoyer</span>
          </button>
        </div>

        {/* Mode emblem */}
        <div className="ml-2 text-amber-600">
          {mode === "agent" ? <Atom className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
        </div>
      </div>
    </motion.div>
  );
}

