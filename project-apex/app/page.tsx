"use client";
import { useMemo, useState } from "react";
import { ProviderBadge } from "@/components/ui/ProviderBadge";
import { ModeToggle, type Mode } from "@/components/ui/ModeToggle";
import VncViewer from "@/components/agent/VncViewer";
import PlanViewer from "@/components/agent/PlanViewer";
import ActionLog from "@/components/agent/ActionLog";
import ChatWindow, { type ChatMessage } from "@/components/chat/ChatWindow";

export default function Home() {
  const [mode, setMode] = useState<Mode>("chat");
  const [messages] = useState<ChatMessage[]>([]);

  const providers = useMemo(() => {
    return ["OpenRouter", "LiteLLM", "E2B"]; // placeholders; tie to env later
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-black/10 dark:border-white/10 bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold">Apex</span>
            <div className="hidden sm:flex items-center gap-2">
              {providers.map((p) => (
                <ProviderBadge key={p} label={p} />
              ))}
            </div>
          </div>
          <ModeToggle value={mode} onChange={setMode} />
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {mode === "chat" ? (
          <section className="grid grid-cols-1 gap-6">
            <div className="text-center py-10">
              <h1 className="text-2xl font-semibold">Par quoi commençons‑nous ?</h1>
            </div>
            <ChatWindow messages={messages} />
          </section>
        ) : (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Computer view */}
            <div className="lg:col-span-2 rounded border border-black/10 dark:border-white/10 p-2 bg-white/50 dark:bg-white/5">
              <VncViewer src={undefined} />
            </div>
            {/* Agent side panel */}
            <div className="flex flex-col gap-4">
              <PlanViewer plan={[]} />
              <ActionLog logs={[]} />
              <div className="mt-auto">
                <ChatWindow messages={messages} />
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

