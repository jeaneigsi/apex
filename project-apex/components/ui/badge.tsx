import { cn } from "./cn";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-black/10 dark:border-white/10",
        "bg-white/60 dark:bg-white/5 backdrop-blur px-2 py-0.5 text-xs",
        className
      )}
    >
      {children}
    </span>
  );
}

