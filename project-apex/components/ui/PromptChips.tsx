import Card from "./Card";

export default function PromptChips({ prompts, onPick }: { prompts: string[]; onPick: (p: string) => void }) {
  return (
    <Card className="p-3">
      <div className="text-xs mb-2 text-gray-600">Try these examples</div>
      <div className="flex flex-wrap gap-2">
        {prompts.map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            className="rounded-full border border-black/10 dark:border-white/10 px-3 py-1 text-sm hover:bg-amber-500/10"
          >
            {p}
          </button>
        ))}
      </div>
    </Card>
  );
}

