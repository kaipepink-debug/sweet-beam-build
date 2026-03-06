import { Crown } from "lucide-react";

const plans = [
  { name: "Plano Anual", percentage: 40, color: "hsl(270, 100%, 55%)" },
  { name: "Plano Semestral", percentage: 32, color: "hsl(240, 70%, 60%)" },
  { name: "Plano Mensal", percentage: 28, color: "hsl(217, 91%, 60%)" },
];

export function TopPlanCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 purple-hover-glow">
      <div className="flex items-center gap-2 mb-4">
        <Crown className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Plano Mais Vendido</h3>
      </div>

      <div className="mb-4">
        <p className="text-xl font-bold text-foreground">Plano Anual</p>
        <p className="text-xs text-muted-foreground mt-1">40% das vendas totais</p>
      </div>

      <div className="space-y-3">
        {plans.map((plan) => (
          <div key={plan.name}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-foreground">{plan.name}</span>
              <span className="text-xs text-muted-foreground">{plan.percentage}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${plan.percentage}%`, backgroundColor: plan.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
