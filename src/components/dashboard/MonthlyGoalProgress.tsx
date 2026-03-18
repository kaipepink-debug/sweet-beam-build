import { MoreHorizontal } from "lucide-react";

export function MonthlyGoalProgress() {
  const percentage = 0;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col items-center justify-center purple-hover-glow">
      <div className="flex items-center justify-between w-full mb-4">
        <h3 className="text-sm font-semibold text-foreground">Meta de Faturamento</h3>
        <button className="text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="relative w-44 h-44 mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80" cy="80" r={radius}
            fill="none" stroke="hsl(0, 0%, 8%)" strokeWidth="10"
          />
          <circle
            cx="80" cy="80" r={radius}
            fill="none" stroke="url(#donutGrad)" strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(270, 100%, 60%)" />
              <stop offset="50%" stopColor="hsl(250, 90%, 55%)" />
              <stop offset="100%" stopColor="hsl(217, 91%, 60%)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">{percentage}%</span>
          <span className="text-[10px] text-muted-foreground mt-1">Meta Mensal</span>
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="text-sm text-foreground font-medium">R$ 0 <span className="text-muted-foreground font-normal">/ R$ 0</span></p>
        <p className="text-[11px] text-muted-foreground">Nenhuma meta definida</p>
      </div>

      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border w-full">
        <div className="flex-1 text-center">
          <p className="text-xs text-muted-foreground">Receita</p>
          <p className="text-sm font-semibold text-foreground">R$ 390k</p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-xs text-muted-foreground">Crescimento</p>
          <p className="text-sm font-semibold text-emerald-400">+12%</p>
        </div>
      </div>
    </div>
  );
}
