"use client";
import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "./cn";

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  labelLeft?: React.ReactNode;
  labelRight?: React.ReactNode;
}

export const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
  ({ className, labelLeft, labelRight, ...props }, ref) => {
    return (
      <div className={cn("flex items-center gap-2")}>        
        {labelLeft && <span className="text-xs text-muted-foreground">{labelLeft}</span>}
        <SwitchPrimitives.Root
          ref={ref}
          className={cn(
            "peer inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 p-0.5",
            "transition-all data-[state=checked]:bg-amber-500/20 data-[state=checked]:border-amber-400/40",
            className
          )}
          {...props}
        >
          <SwitchPrimitives.Thumb
            className={cn(
              "pointer-events-none block h-6 w-6 rounded-full bg-black/10 dark:bg-white/10 shadow transition-transform",
              "data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-0"
            )}
          />
        </SwitchPrimitives.Root>
        {labelRight && <span className="text-xs text-muted-foreground">{labelRight}</span>}
      </div>
    );
  }
);
Switch.displayName = "Switch";

