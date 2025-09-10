"use client";
import { useMemo, useState } from "react";
import { ProviderBadge } from "@/components/ui/ProviderBadge";
import VncViewer from "@/components/agent/VncViewer";
import PlanViewer from "@/components/agent/PlanViewer";
import ActionLog from "@/components/agent/ActionLog";
import ChatWindow, { type ChatMessage } from "@/components/chat/ChatWindow";
import Card from "@/components/ui/Card";
import PromptChips from "@/components/ui/PromptChips";
import FloatingChatBar from "@/components/app/FloatingChatBar";
import type { Mode } from "@/components/ui/ModeToggle";

export default function Home() {
  const [mode, setMode] = useState<Mode>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const providers = useMemo(() => {
    return ["OpenRouter", "LiteLLM", "E2B"]; // placeholders; tie to env later
  }, []);

  const send = (v: string) =>
    setMessages((prev) => [...prev, { id: String(prev.length + 1), role: "user", content: v }]);

  return (
    <div className="min-h-screen flex flex-col pb-24">
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
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {mode === "chat" ? (
          <section className="grid grid-cols-1 gap-6">
            <div className="text-center py-10">
              <h1 className="text-2xl font-semibold">Par quoi commençons‑nous ?</h1>
            </div>
            <ChatWindow messages={messages} showInput={false} />
            <PromptChips
              prompts={["Créer un script JavaScript", "Éditer un document dans VS Code", "Parcourir un repo GitHub"]}
              onPick={(p) => send(p)}
            />
          </section>
        ) : (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Computer view */}
            <Card className="lg:col-span-2 p-2">
              <VncViewer src={undefined} />
            </Card>
            {/* Agent side panel */}
            <div className="flex flex-col gap-4">
              <Card className="p-3">
                <PlanViewer plan={[]} />
              </Card>
              <Card className="p-3">
                <ActionLog logs={[]} />
              </Card>
              <div className="mt-auto">
                <ChatWindow messages={messages} showInput={false} />
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Floating bar shared for both modes */}
      <FloatingChatBar mode={mode} onToggleMode={setMode} onSend={send} />
    </div>
  );
}

