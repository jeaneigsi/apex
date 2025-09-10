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
    <div className="min-h-screen flex flex-col pb-24 bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-semibold tracking-tight">Apex</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 ml-4">
              {providers.map((p) => (
                <ProviderBadge key={p} label={p} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
            <span className="text-xs text-muted-foreground font-medium">En ligne</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {mode === "chat" ? (
          <section className="grid grid-cols-1 gap-8">
            <div className="text-center py-16">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-3">Par quoi commençons‑nous ?</h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                Choisissez entre une conversation naturelle ou déployez un agent autonome pour accomplir vos tâches.
              </p>
            </div>
            <ChatWindow messages={messages} showInput={false} />
            <PromptChips
              prompts={["Créer un script JavaScript", "Éditer un document dans VS Code", "Parcourir un repo GitHub"]}
              onPick={(p) => send(p)}
            />
          </section>
        ) : (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Computer view */}
            <Card className="lg:col-span-2 p-1 shadow-xl">
              <div className="bg-muted/30 rounded-lg p-3 mb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <span className="font-medium">Environnement E2B actif</span>
                </div>
              </div>
              <VncViewer src={undefined} />
            </Card>
            {/* Agent side panel */}
            <div className="flex flex-col gap-6">
              <Card className="p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Plan d'exécution</h3>
                </div>
                <PlanViewer plan={[]} />
              </Card>
              <Card className="p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-accent"></div>
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Journal d'actions</h3>
                </div>
                <ActionLog logs={[]} />
              </Card>
              <div className="mt-auto shadow-lg">
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

