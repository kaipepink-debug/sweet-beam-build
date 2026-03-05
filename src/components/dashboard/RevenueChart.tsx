import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const data = [
  { month: "Jan", value: 18500 },
  { month: "Fev", value: 22300 },
  { month: "Mar", value: 19800 },
  { month: "Abr", value: 27400 },
  { month: "Mai", value: 31200 },
  { month: "Jun", value: 28900 },
  { month: "Jul", value: 35600 },
  { month: "Ago", value: 38100 },
  { month: "Set", value: 42500 },
  { month: "Out", value: 45800 },
  { month: "Nov", value: 48200 },
  { month: "Dez", value: 52400 },
];

export function RevenueChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-foreground">Faturamento ao Longo do Tempo</h3>
        <p className="text-xs text-muted-foreground mt-1">Receita mensal em R$</p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(270, 100%, 50%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(270, 100%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 20%, 15%)" />
            <XAxis
              dataKey="month"
              tick={{ fill: "hsl(230, 15%, 55%)", fontSize: 12 }}
              axisLine={{ stroke: "hsl(240, 20%, 15%)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(230, 15%, 55%)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
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
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(270, 100%, 50%)"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
