"use client";
import { useState } from "react";
import { ChevronDown, Check, Zap, Database, Cloud } from "lucide-react";
import { cn } from "./cn";

const PROVIDER_ICONS = {
  OpenRouter: Zap,
  LiteLLM: Database,
  E2B: Cloud,
} as const;

const PROVIDER_STATUS = {
  OpenRouter: "active",
  LiteLLM: "active", 
  E2B: "inactive",
} as const;

export function ProviderBadge({ 
  label, 
  className,
  showDropdown = false,
  onProviderChange
}: { 
  label: string; 
  className?: string;
  showDropdown?: boolean;
  onProviderChange?: (provider: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(label);
  
  const Icon = PROVIDER_ICONS[label as keyof typeof PROVIDER_ICONS];
  const status = PROVIDER_STATUS[label as keyof typeof PROVIDER_STATUS];
  
  const providers = Object.keys(PROVIDER_ICONS);

  if (!showDropdown) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
          "border-border/60 bg-card/80 backdrop-blur-sm hover:bg-card/90 hover:border-border",
          "shadow-sm hover:shadow-md",
          status === "active" 
            ? "text-success border-success/20 bg-success/5" 
            : "text-muted-foreground",
          className
        )}
      >
        {Icon && <Icon className="h-3.5 w-3.5" />}
        <span>{label}</span>
        {status === "active" && (
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        )}
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
          "border-border/60 bg-card/80 backdrop-blur-sm hover:bg-card/90 hover:border-border",
          "shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20",
          status === "active" 
            ? "text-success border-success/20 bg-success/5" 
            : "text-muted-foreground",
          className
        )}
      >
        {Icon && <Icon className="h-3.5 w-3.5" />}
        <span>{selectedProvider}</span>
        <ChevronDown className={cn(
          "h-3 w-3 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-48 z-20 rounded-xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-xl">
            <div className="p-2">
              {providers.map((provider) => {
                const ProviderIcon = PROVIDER_ICONS[provider as keyof typeof PROVIDER_ICONS];
                const providerStatus = PROVIDER_STATUS[provider as keyof typeof PROVIDER_STATUS];
                const isSelected = provider === selectedProvider;
                
                return (
                  <button
                    key={provider}
                    onClick={() => {
                      setSelectedProvider(provider);
                      onProviderChange?.(provider);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      "hover:bg-muted/60 focus:outline-none focus:bg-muted/60",
                      isSelected && "bg-primary/10 text-primary"
                    )}
                  >
                    <ProviderIcon className="h-4 w-4" />
                    <span className="flex-1 text-left">{provider}</span>
                    <div className="flex items-center gap-2">
                      {providerStatus === "active" && (
                        <div className="w-2 h-2 rounded-full bg-success" />
                      )}
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}