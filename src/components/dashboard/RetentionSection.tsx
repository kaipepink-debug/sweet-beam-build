import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from "recharts";

const retentionData = [
  { month: "Jan", rate: 94 },
  { month: "Fev", rate: 92 },
  { month: "Mar", rate: 95 },
  { month: "Abr", rate: 93 },
  { month: "Mai", rate: 96 },
  { month: "Jun", rate: 95 },
];

export function RetentionSection() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-foreground">Retenção</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Taxa de Churn</span>
          <span className="text-xl font-semibold text-foreground">3.2%</span>
          <span className="text-xs text-emerald-400">-0.5% vs mês anterior</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Tempo Médio</span>
          <span className="text-xl font-semibold text-foreground">8.4 meses</span>
          <span className="text-xs text-emerald-400">+0.3 meses</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Retenção Mensal</span>
          <div className="h-[60px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={retentionData}>
                <XAxis dataKey="month" hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(240, 50%, 6%)",
                    border: "1px solid hsl(240, 20%, 15%)",
                    borderRadius: "8px",
                    color: "hsl(230, 30%, 92%)",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${v}%`, "Retenção"]}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="hsl(270, 100%, 50%)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
