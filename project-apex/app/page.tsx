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
import { Settings, Sparkles } from "lucide-react";

export default function Home() {
  const [mode, setMode] = useState<Mode>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedProvider, setSelectedProvider] = useState("OpenRouter");

  const providers = useMemo(() => {
    return ["OpenRouter", "LiteLLM", "E2B"]; // placeholders; tie to env later
  }, []);

  const send = (v: string) =>
    setMessages((prev) => [...prev, { id: String(prev.length + 1), role: "user", content: v }]);

  return (
    <div className="min-h-screen flex flex-col pb-24 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg ring-1 ring-primary/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight">Apex</span>
                <span className="text-xs text-muted-foreground font-medium -mt-1">AI Assistant</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3 ml-6">
              <div className="w-px h-6 bg-border/60" />
              <ProviderBadge 
                label={selectedProvider} 
                showDropdown={true}
                onProviderChange={setSelectedProvider}
              />
              {providers.filter(p => p !== selectedProvider).map((p) => (
                <ProviderBadge key={p} label={p} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-sm"></div>
              <span className="text-xs text-muted-foreground font-medium">Système opérationnel</span>
            </div>
            <button className="p-2 rounded-lg hover:bg-muted/60 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        {mode === "chat" ? (
          <section className="grid grid-cols-1 gap-10">
            <div className="text-center py-20">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-xl ring-1 ring-primary/20">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                Par quoi commençons‑nous ?
              </h1>
              <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
                Choisissez entre une conversation naturelle ou déployez un agent autonome pour accomplir vos tâches.
              </p>
            </div>
            <ChatWindow messages={messages} showInput={false} />
            <PromptChips
              prompts={[
                "Créer un script JavaScript avancé", 
                "Éditer un document dans VS Code", 
                "Parcourir et analyser un repo GitHub",
                "Automatiser une tâche système"
              ]}
              onPick={(p) => send(p)}
            />
          </section>
        ) : (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* Computer view */}
            <Card className="lg:col-span-2 p-2 shadow-2xl ring-1 ring-border/50">
              <div className="bg-gradient-to-r from-muted/40 to-muted/20 rounded-xl p-4 mb-3 border border-border/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-3 h-3 rounded-full bg-success shadow-sm"></div>
                    <span className="font-semibold text-foreground">Environnement E2B</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground font-medium">Ubuntu 22.04</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>1366×768</span>
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/50"></div>
                    <span>96 DPI</span>
                  </div>
                </div>
              </div>
              <VncViewer src={undefined} />
            </Card>
            {/* Agent side panel */}
            <div className="flex flex-col gap-6 lg:gap-8">
              <Card className="p-5 shadow-xl ring-1 ring-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm"></div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Plan d'exécution</h3>
                </div>
                <PlanViewer plan={[]} />
              </Card>
              <Card className="p-5 shadow-xl ring-1 ring-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-sm"></div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Journal d'actions</h3>
                </div>
                <ActionLog logs={[]} />
              </Card>
              <div className="mt-auto shadow-xl ring-1 ring-border/50 rounded-lg overflow-hidden">
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

