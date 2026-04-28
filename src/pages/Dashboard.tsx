import { useEffect, useMemo, useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Users } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { RangeFilter, RangeFilterValue } from "@/components/dashboard/RangeFilter";
import { getRange, formatBRL, eachDay, dateKey } from "@/lib/dateRanges";
import { cn } from "@/lib/utils";

interface Assinante {
  id: string;
  valor: number;
  data_criacao: string;
  status: string;
  email: string;
}

interface Custo {
  id: string;
  data: string;
  valor: number;
  categoria: string;
}

export default function Dashboard() {
  const [range, setRange] = useState<RangeFilterValue>({ preset: "hoje" });
  const [vendas, setVendas] = useState<Assinante[]>([]);
  const [custos, setCustos] = useState<Custo[]>([]);
  const [loading, setLoading] = useState(true);

  const r = useMemo(() => getRange(range.preset, { from: range.from, to: range.to }), [range]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const fromStr = r.from.toISOString().slice(0, 10);
      const toStr = r.to.toISOString().slice(0, 10);

      const [vRes, cRes] = await Promise.all([
        supabase
          .from("assinantes")
          .select("id,valor,data_criacao,status,email")
          .gte("data_criacao", fromStr)
          .lte("data_criacao", toStr),
        supabase
          .from("custos")
          .select("id,data,valor,categoria")
          .gte("data", fromStr)
          .lte("data", toStr),
      ]);

      setVendas((vRes.data as any) || []);
      setCustos((cRes.data as any) || []);
      setLoading(false);
    };
    load();
  }, [r.from.getTime(), r.to.getTime()]);

  const totalVendas = useMemo(
    () => vendas.reduce((s, v) => s + Number(v.valor || 0), 0),
    [vendas]
  );
  const totalCustos = useMemo(
    () => custos.reduce((s, c) => s + Number(c.valor || 0), 0),
    [custos]
  );
  const lucro = totalVendas - totalCustos;
  const margem = totalVendas > 0 ? (lucro / totalVendas) * 100 : 0;
  const numClientes = useMemo(() => new Set(vendas.map((v) => v.email)).size, [vendas]);

  const chartData = useMemo(() => {
    const days = eachDay(r.from, r.to);
    const vMap: Record<string, number> = {};
    const cMap: Record<string, number> = {};
    vendas.forEach((v) => {
      const k = dateKey(v.data_criacao);
      vMap[k] = (vMap[k] || 0) + Number(v.valor || 0);
    });
    custos.forEach((c) => {
      const k = dateKey(c.data);
      cMap[k] = (cMap[k] || 0) + Number(c.valor || 0);
    });
    return days.map((d) => {
      const v = vMap[d] || 0;
      const c = cMap[d] || 0;
      const dt = new Date(d + "T00:00:00");
      return {
        day: dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        vendas: v,
        custos: c,
        lucro: v - c,
      };
    });
  }, [vendas, custos, r.from, r.to]);

  const metrics = [
    { title: "Vendas no período", value: formatBRL(totalVendas), icon: DollarSign, color: "hsl(142, 71%, 45%)" },
    { title: "Custos no período", value: formatBRL(totalCustos), icon: TrendingDown, color: "hsl(0, 84%, 60%)" },
    { title: "Lucro líquido", value: formatBRL(lucro), icon: Wallet, color: lucro >= 0 ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)" },
    { title: "Margem", value: `${margem.toFixed(1)}%`, icon: TrendingUp, color: "hsl(270, 100%, 65%)" },
    { title: "Clientes únicos", value: String(numClientes), icon: Users, color: "hsl(217, 91%, 60%)" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Acompanhe vendas, custos e lucro da operação</p>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
        </div>
        <RangeFilter value={range} onChange={setRange} />
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map((m) => (
          <div key={m.title} className="rounded-2xl border border-border bg-card p-4 relative overflow-hidden purple-hover-glow">
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-3xl opacity-15 translate-x-4 -translate-y-4" style={{ backgroundColor: m.color }} />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${m.color}20` }}>
                <m.icon className="h-4 w-4" style={{ color: m.color }} />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mb-0.5 relative z-10">{m.title}</p>
            <p className={cn("text-xl font-bold tracking-tight relative z-10")} style={{ color: m.title === "Lucro líquido" ? m.color : undefined }}>
              {loading ? "..." : m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Gráfico vendas vs custos vs lucro */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Evolução financeira</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Vendas, custos e lucro por dia</p>
          </div>
        </div>

        <div className="h-[320px]">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Sem dados no período</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="g-vendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g-custos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g-lucro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(270, 100%, 65%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(270, 100%, 65%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 10%)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "hsl(0, 0%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(0, 0%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(0, 0%, 6%)", border: "1px solid hsl(0, 0%, 15%)", borderRadius: 10, fontSize: 12 }}
                  formatter={(v: number, name: string) => [formatBRL(v), name]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="vendas" name="Vendas" stroke="hsl(142, 71%, 45%)" strokeWidth={2} fill="url(#g-vendas)" />
                <Area type="monotone" dataKey="custos" name="Custos" stroke="hsl(0, 84%, 60%)" strokeWidth={2} fill="url(#g-custos)" />
                <Area type="monotone" dataKey="lucro" name="Lucro" stroke="hsl(270, 100%, 65%)" strokeWidth={2.5} fill="url(#g-lucro)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
