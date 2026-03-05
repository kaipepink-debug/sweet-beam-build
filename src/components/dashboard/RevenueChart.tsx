import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Bar, BarChart, ComposedChart } from "recharts";
import { MoreHorizontal } from "lucide-react";

const data = [
  { quarter: "Q1", thisYear: 3200000, lastYear: 2800000 },
  { quarter: "Q2", thisYear: 4500000, lastYear: 3100000 },
  { quarter: "Q3", thisYear: 5800000, lastYear: 4200000 },
  { quarter: "Q4", thisYear: 8100000, lastYear: 5500000 },
  { quarter: "Q1'", thisYear: 6200000, lastYear: 4800000 },
  { quarter: "Q2'", thisYear: 7400000, lastYear: 5100000 },
  { quarter: "Q3'", thisYear: 9200000, lastYear: 6300000 },
  { quarter: "Q4'", thisYear: 11800000, lastYear: 7200000 },
];

export function RevenueChart() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Analítico</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground px-3 py-1 border border-border rounded-lg">Estimativa de Vendas</span>
          <button className="text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(270, 100%, 50%)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(270, 100%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 20%, 12%)" vertical={false} />
            <XAxis
              dataKey="quarter"
              tick={{ fill: "hsl(230, 15%, 45%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(230, 15%, 45%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `R$${(v / 1000000).toFixed(0)}M`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(240, 50%, 8%)",
                border: "1px solid hsl(240, 20%, 18%)",
                borderRadius: "10px",
                color: "hsl(230, 30%, 92%)",
                fontSize: 12,
              }}
              formatter={(value: number) => [`R$ ${(value / 1000).toLocaleString("pt-BR")}k`, ""]}
            />
            <Bar dataKey="lastYear" fill="hsl(240, 20%, 18%)" radius={[4, 4, 0, 0]} barSize={20} />
            <Area
              type="monotone"
              dataKey="thisYear"
              stroke="hsl(270, 100%, 55%)"
              strokeWidth={2.5}
              fill="url(#areaGradient)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
