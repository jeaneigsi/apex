import * as React from "react";
import { cn } from "./cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-full border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5",
        "px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
