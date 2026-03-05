import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const periods = ["Hoje", "7 dias", "30 dias", "12 meses", "Personalizado"] as const;

interface DashboardTopbarProps {
  activePeriod: string;
  onPeriodChange: (period: string) => void;
}

export function DashboardTopbar({ activePeriod, onPeriodChange }: DashboardTopbarProps) {
  return (
    <header className="h-14 flex items-center justify-between border-b border-border px-4 md:px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <h1 className="text-lg font-semibold text-foreground tracking-tight hidden sm:block">
          Visão Geral
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-md transition-colors",
                activePeriod === p
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/20 text-primary text-xs">AD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
