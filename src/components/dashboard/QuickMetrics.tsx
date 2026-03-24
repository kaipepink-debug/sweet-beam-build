import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, Users, Wrench, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export function QuickMetrics() {
  const [totalVendas, setTotalVendas] = useState(0);
  const [assinaturasAtivas, setAssinaturasAtivas] = useState(0);
  const [clientesTotais, setClientesTotais] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("assinantes").select("*");
      if (data) {
        const all = data as any[];
        const ativos = all.filter(a => a.status === "Ativa");
        setTotalVendas(ativos.reduce((sum, a) => sum + Number(a.valor || 0), 0));
        setAssinaturasAtivas(ativos.length);
        setClientesTotais(all.length);
      }
    };
    fetch();
  }, []);

  const metrics = [
    { title: "Total de Vendas", value: `R$ ${totalVendas.toFixed(2).replace(".", ",")}`, change: 0, icon: DollarSign, color: "hsl(142, 71%, 45%)" },
    { title: "Assinaturas Ativas", value: String(assinaturasAtivas), change: 0, icon: TrendingUp, color: "hsl(270, 100%, 65%)" },
    { title: "Clientes Totais", value: String(clientesTotais), change: 0, icon: Users, color: "hsl(217, 91%, 60%)" },
    { title: "Ferramentas IA Ativas", value: "0", change: 0, icon: Wrench, color: "hsl(24, 95%, 53%)" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => {
        const isPositive = m.change >= 0;
        return (
          <div key={m.title} className="rounded-2xl border border-border bg-card p-4 relative overflow-hidden purple-hover-glow">
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-3xl opacity-15 translate-x-4 -translate-y-4" style={{ backgroundColor: m.color }} />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${m.color}20` }}>
                <m.icon className="h-4 w-4" style={{ color: m.color }} />
              </div>
              <div className={cn("flex items-center gap-0.5 text-[11px] font-medium px-2 py-0.5 rounded-full", isPositive ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10")}>
                {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {Math.abs(m.change)}%
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mb-0.5 relative z-10">{m.title}</p>
            <p className="text-xl font-bold text-foreground tracking-tight relative z-10">{m.value}</p>
          </div>
        );
      })}
    </div>
  );
}
