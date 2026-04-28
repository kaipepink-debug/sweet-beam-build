import { useEffect, useMemo, useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Users } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { RangeFilter, RangeFilterValue } from "@/components/dashboard/RangeFilter";
import { getRange, formatBRL, eachDay, dateKey } from "@/lib/dateRanges";

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
    { title: "Lucro líquido", value: formatBRL(lucro), icon: Wallet, color: lucro >= 0 ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)", highlight: true },
    { title: "Margem", value: `${margem.toFixed(1)}%`, icon: TrendingUp, color: "hsl(270, 100%, 65%)" },
    { title: "Clientes únicos", value: String(numClientes), icon: Users, color: "hsl(217, 91%, 60%)" },
  ];

  const formatAxis = (v: number) => {
    if (v >= 1_000_000) return `R$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `R$${(v / 1_000).toFixed(1)}k`;
    return `R$${v}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70 mb-1.5 font-light">Visão geral</p>
          <h1 className="text-3xl md:text-4xl font-extralight text-foreground tracking-tight">Dashboard</h1>
        </div>
        <RangeFilter value={range} onChange={setRange} />
      </div>

      {/* Métricas — cards finos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {metrics.map((m) => (
          <div
            key={m.title}
            className="group rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm p-4 relative overflow-hidden transition-all duration-300 hover:border-border hover:bg-card/60"
          >
            <div
              className="absolute inset-x-0 top-0 h-px opacity-60"
              style={{ background: `linear-gradient(90deg, transparent, ${m.color}, transparent)` }}
            />
            <div className="flex items-center gap-2 mb-3">
              <m.icon className="h-3.5 w-3.5" style={{ color: m.color }} strokeWidth={1.5} />
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-light">{m.title}</p>
            </div>
            <p
              className="text-2xl font-extralight tracking-tight tabular-nums"
              style={{ color: m.highlight ? m.color : "hsl(var(--foreground))" }}
            >
              {loading ? "—" : m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Gráfico — linha futurista */}
      <div className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm p-6 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 font-light mb-1.5">Evolução financeira</p>
            <p className="text-3xl md:text-4xl font-extralight tracking-tight tabular-nums text-foreground">
              {loading ? "—" : formatBRL(lucro)}
            </p>
            <p className="text-xs text-muted-foreground/80 font-light mt-1">
              Lucro do período • {vendas.length} {vendas.length === 1 ? "venda" : "vendas"}
            </p>
          </div>
          <div className="flex items-center gap-5 text-[11px] font-light">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(142, 71%, 45%)", boxShadow: "0 0 8px hsl(142, 71%, 45%)" }} />
              <span className="text-muted-foreground">Vendas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(0, 84%, 60%)", boxShadow: "0 0 8px hsl(0, 84%, 60%)" }} />
              <span className="text-muted-foreground">Custos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(270, 100%, 65%)", boxShadow: "0 0 8px hsl(270, 100%, 65%)" }} />
              <span className="text-muted-foreground">Lucro</span>
            </div>
          </div>
        </div>

        <div className="h-[340px]">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground/60 font-light">Sem dados no período</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <filter id="glow-vendas" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <filter id="glow-custos" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <filter id="glow-lucro" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="hsl(0, 0%, 14%)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "hsl(0, 0%, 45%)", fontSize: 10, fontWeight: 300 }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  tick={{ fill: "hsl(0, 0%, 45%)", fontSize: 10, fontWeight: 300 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatAxis}
                  width={55}
                />
                <Tooltip
                  cursor={{ stroke: "hsl(270, 100%, 65%)", strokeWidth: 1, strokeDasharray: "3 3", opacity: 0.5 }}
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 4%)",
                    border: "1px solid hsl(0, 0%, 18%)",
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 300,
                    padding: "10px 12px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                  }}
                  labelStyle={{ color: "hsl(0, 0%, 60%)", fontSize: 10, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}
                  formatter={(v: number, name: string) => [formatBRL(v), name]}
                />
                <Line
                  type="monotone"
                  dataKey="vendas"
                  name="Vendas"
                  stroke="hsl(142, 71%, 45%)"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 4, fill: "hsl(142, 71%, 45%)", stroke: "hsl(0, 0%, 4%)", strokeWidth: 2 }}
                  filter="url(#glow-vendas)"
                />
                <Line
                  type="monotone"
                  dataKey="custos"
                  name="Custos"
                  stroke="hsl(0, 84%, 60%)"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 4, fill: "hsl(0, 84%, 60%)", stroke: "hsl(0, 0%, 4%)", strokeWidth: 2 }}
                  filter="url(#glow-custos)"
                />
                <Line
                  type="monotone"
                  dataKey="lucro"
                  name="Lucro"
                  stroke="hsl(270, 100%, 65%)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, fill: "hsl(270, 100%, 65%)", stroke: "hsl(0, 0%, 4%)", strokeWidth: 2 }}
                  filter="url(#glow-lucro)"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
