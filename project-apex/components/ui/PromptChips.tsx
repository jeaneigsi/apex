import Card from "./Card";
import { Sparkles } from "lucide-react";

export default function PromptChips({ prompts, onPick }: { prompts: string[]; onPick: (p: string) => void }) {
  return (
    <Card className="p-6 shadow-lg ring-1 ring-border/50">
      <div className="flex items-center gap-2 text-sm mb-4 text-muted-foreground font-medium">
        <Sparkles className="w-4 h-4" />
        <span>Exemples pour commencer</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {prompts.map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-primary/10 hover:border-primary/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {p}
          </button>
        ))}
      </div>
    </Card>
  );
}

