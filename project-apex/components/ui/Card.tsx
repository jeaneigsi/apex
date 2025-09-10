import { cn } from "./cn";

export default function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-200", className)}>
      {children}
    </div>
  );
}

