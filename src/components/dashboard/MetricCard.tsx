import { ArrowUp, ArrowDown, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  accentColor: string;
  subtitle?: string;
}

export function MetricCard({ title, value, change, icon: Icon, accentColor, subtitle = "Comparado ao mês anterior" }: MetricCardProps) {
  const isPositive = change >= 0;

  return (
    <div className={cn(
      "rounded-2xl border border-border bg-card p-5 flex flex-col gap-4 relative overflow-hidden"
    )}>
      {/* Colored accent glow */}
      <div
        className="absolute top-0 left-0 w-24 h-24 rounded-full blur-3xl opacity-20 -translate-x-6 -translate-y-6"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-center justify-between relative z-10">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <Icon className="h-5 w-5" style={{ color: accentColor }} />
        </div>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="relative z-10">
        <p className="text-xs text-muted-foreground mb-1">{title}</p>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-foreground tracking-tight">{value}</span>
          <div
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              isPositive ? "text-emerald-400" : "text-red-400"
            )}
          >
            {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {Math.abs(change)}%
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">{subtitle}</p>
      </div>
    </div>
  );
}
