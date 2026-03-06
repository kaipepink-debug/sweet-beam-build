import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";

const data = [
  { day: "Mon", subs: 42 },
  { day: "Tue", subs: 58 },
  { day: "Wed", subs: 35 },
  { day: "Thu", subs: 72 },
  { day: "Fri", subs: 85 },
  { day: "Sat", subs: 48 },
  { day: "Sun", subs: 63 },
];

export function SubscriptionGrowth() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 purple-hover-glow">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Crescimento de Assinaturas</h3>
        </div>
        <span className="text-[11px] text-emerald-400 font-medium">+18.2%</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">Novas assinaturas por dia</p>

      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 6%)" vertical={false} horizontal={true} />
            <XAxis
              dataKey="day"
              tick={{ fill: "hsl(0, 0%, 40%)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(0, 0%, 40%)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "hsl(0, 0%, 8%)" }}
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 6%)",
                border: "1px solid hsl(0, 0%, 15%)",
                borderRadius: "10px",
                color: "hsl(0, 0%, 90%)",
                fontSize: 12,
              }}
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(270, 100%, 60%)" />
                <stop offset="50%" stopColor="hsl(250, 90%, 55%)" />
                <stop offset="100%" stopColor="hsl(217, 91%, 55%)" />
              </linearGradient>
            </defs>
            <Bar dataKey="subs" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
