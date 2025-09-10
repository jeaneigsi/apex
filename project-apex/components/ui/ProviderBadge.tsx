import { cn } from "./cn";

export function ProviderBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs",
        "border-black/10 dark:border-white/15 bg-white/60 dark:bg-white/5 backdrop-blur",
        className
      )}
    >
      {label}
    </span>
  );
}

