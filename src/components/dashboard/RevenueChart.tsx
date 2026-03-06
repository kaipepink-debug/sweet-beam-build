import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { MoreHorizontal } from "lucide-react";

const data = [
  { day: "Mon", revenue: 42000, target: 38000 },
  { day: "Tue", revenue: 55000, target: 40000 },
  { day: "Wed", revenue: 48000, target: 42000 },
  { day: "Thu", revenue: 62000, target: 45000 },
  { day: "Fri", revenue: 78000, target: 48000 },
  { day: "Sat", revenue: 58000, target: 50000 },
  { day: "Sun", revenue: 85000, target: 52000 },
];

export function RevenueChart() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 h-full purple-hover-glow">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Faturamento da Plataforma</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Período semanal</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-muted-foreground">Receita</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "hsl(217, 91%, 60%)" }} />
              <span className="text-muted-foreground">Meta</span>
            </div>
          </div>
          <button className="text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-4 mt-3">
        <div>
          <p className="text-[10px] text-muted-foreground">Receita Mensal</p>
          <p className="text-lg font-bold text-foreground">R$ 428.000</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Crescimento</p>
          <p className="text-lg font-bold text-emerald-400">+12,4%</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Meta Mensal</p>
          <p className="text-lg font-bold text-foreground">R$ 500.000</p>
        </div>
      </div>

      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(270, 100%, 60%)" stopOpacity={0.35} />
                <stop offset="50%" stopColor="hsl(240, 80%, 55%)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="hsl(270, 100%, 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="revenueStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(270, 100%, 60%)" />
                <stop offset="100%" stopColor="hsl(217, 91%, 65%)" />
              </linearGradient>
              <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.1} />
                <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 10%)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: "hsl(0, 0%, 40%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(0, 0%, 40%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 6%)",
                border: "1px solid hsl(0, 0%, 15%)",
                borderRadius: "10px",
                color: "hsl(0, 0%, 90%)",
                fontSize: 12,
              }}
              formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, ""]}
            />
            <Area
              type="monotone"
              dataKey="target"
              stroke="hsl(217, 91%, 55%)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="url(#targetGradient)"
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="url(#revenueStroke)"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "hsl(270, 100%, 65%)", stroke: "hsl(270, 100%, 80%)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
