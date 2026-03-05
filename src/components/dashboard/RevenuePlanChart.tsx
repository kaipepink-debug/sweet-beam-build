import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const data = [
  { plan: "Mensal", value: 18200, fill: "hsl(270, 100%, 50%)" },
  { plan: "Semestral", value: 12400, fill: "hsl(270, 80%, 65%)" },
  { plan: "Anual", value: 21800, fill: "hsl(270, 60%, 40%)" },
];

export function RevenuePlanChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-foreground">Receita por Plano</h3>
        <p className="text-xs text-muted-foreground mt-1">Distribuição de receita</p>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 20%, 15%)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: "hsl(230, 15%, 55%)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              type="category"
              dataKey="plan"
              tick={{ fill: "hsl(230, 15%, 55%)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(240, 50%, 6%)",
                border: "1px solid hsl(240, 20%, 15%)",
                borderRadius: "8px",
                color: "hsl(230, 30%, 92%)",
                fontSize: 12,
              }}
              formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, "Receita"]}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24} fill="hsl(270, 100%, 50%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
