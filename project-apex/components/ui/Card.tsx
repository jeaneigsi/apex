import { cn } from "./cn";

export default function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-lg border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur", className)}>
      {children}
    </div>
  );
}

