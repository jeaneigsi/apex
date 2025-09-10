"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Atom, MessageSquare, Mic, Paperclip, Send } from "lucide-react";
import { cn } from "@/components/ui/cn";
import { Mode } from "@/components/ui/ModeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

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
      className="fixed inset-x-0 z-20 flex justify-center px-4"
      style={{ bottom: `max(16px, env(safe-area-inset-bottom))` }}
    >
      <div
        className={cn(
          "w-full max-w-3xl rounded-2xl border border-black/10 dark:border-white/10",
          "bg-white/70 dark:bg-white/5 backdrop-blur shadow-lg",
          "px-3 py-2 flex items-center gap-2"
        )}
      >
        {/* Mode switch inside the bar */}
        <div className="hidden sm:block">
          <Switch
            checked={mode === "agent"}
            onCheckedChange={(v) => onToggleMode(v ? "agent" : "chat")}
          />
        </div>

        <div className="flex-1 flex items-center gap-2">
          <Button variant="ghost" size="sm" aria-label="Attach" className="rounded-full p-2 h-auto">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
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
          <Button variant="ghost" size="sm" aria-label="Mic" className="rounded-full p-2 h-auto">
            <Mic className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="md"
            className="gap-2 rounded-full"
            onClick={() => {
              if (value.trim()) {
                onSend(value.trim());
                setValue("");
              }
            }}
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Envoyer</span>
          </Button>
        </div>

        {/* Mode emblem */}
        <div className="ml-2 text-amber-600">
          {mode === "agent" ? <Atom className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
        </div>
      </div>
    </motion.div>
  );
}
