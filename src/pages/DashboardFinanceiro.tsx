import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Loader2, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { RangeFilter, RangeFilterValue } from "@/components/dashboard/RangeFilter";
import { getRange, formatBRL } from "@/lib/dateRanges";

const CATEGORIAS = ["Ferramentas", "Anúncios", "Equipe", "Infraestrutura", "Outros"] as const;
type Categoria = typeof CATEGORIAS[number];

interface Custo {
  id: string;
  data: string;
  categoria: Categoria;
  descricao: string | null;
  valor: number;
}

const CAT_COLORS: Record<Categoria, string> = {
  Ferramentas: "hsl(270, 100%, 65%)",
  "Anúncios": "hsl(24, 95%, 53%)",
  Equipe: "hsl(217, 91%, 60%)",
  Infraestrutura: "hsl(142, 71%, 45%)",
  Outros: "hsl(0, 0%, 60%)",
};

export default function DashboardFinanceiro() {
  const { user } = useAuth();
  const [range, setRange] = useState<RangeFilterValue>({ preset: "30d" });
  const [custos, setCustos] = useState<Custo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // form
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [categoria, setCategoria] = useState<Categoria>("Ferramentas");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");

  const r = useMemo(() => getRange(range.preset, { from: range.from, to: range.to }), [range]);

  const fetchCustos = async () => {
    setLoading(true);
    const { data: rows, error } = await supabase
      .from("custos")
      .select("*")
      .gte("data", r.from.toISOString().slice(0, 10))
      .lte("data", r.to.toISOString().slice(0, 10))
      .order("data", { ascending: false });
    if (error) toast.error("Erro ao carregar custos");
    setCustos((rows as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCustos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r.from.getTime(), r.to.getTime()]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const v = parseFloat(valor.replace(",", "."));
    if (isNaN(v) || v <= 0) {
      toast.error("Valor inválido");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("custos").insert({
      data,
      categoria,
      descricao: descricao || null,
      valor: v,
      created_by: user.id,
    });
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar custo");
      return;
    }
    toast.success("Custo lançado");
    setDescricao("");
    setValor("");
    fetchCustos();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("custos").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir");
      return;
    }
    toast.success("Excluído");
    fetchCustos();
  };

  const totalPorCategoria = useMemo(() => {
    const acc: Record<Categoria, number> = {
      Ferramentas: 0, "Anúncios": 0, Equipe: 0, Infraestrutura: 0, Outros: 0,
    };
    custos.forEach((c) => { acc[c.categoria] = (acc[c.categoria] || 0) + Number(c.valor); });
    return acc;
  }, [custos]);

  const total = useMemo(() => custos.reduce((s, c) => s + Number(c.valor), 0), [custos]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Lance os gastos do dia para apurar o lucro</p>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Financeiro</h1>
        </div>
        <RangeFilter value={range} onChange={setRange} />
      </div>

      {/* Resumo por categoria */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4 col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-red-400" />
            <p className="text-[11px] text-muted-foreground">Total no período</p>
          </div>
          <p className="text-xl font-bold text-foreground">{formatBRL(total)}</p>
        </div>
        {CATEGORIAS.map((cat) => (
          <div key={cat} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CAT_COLORS[cat] }} />
              <p className="text-[11px] text-muted-foreground truncate">{cat}</p>
            </div>
            <p className="text-base font-semibold text-foreground">{formatBRL(totalPorCategoria[cat])}</p>
          </div>
        ))}
      </div>

      {/* Form de lançamento */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Lançar novo custo</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Data</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Categoria</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as Categoria)}
              className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary"
            >
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-[11px] text-muted-foreground mb-1 block">Descrição (opcional)</label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Anúncio Facebook campanha X"
              className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Valor (R$)</label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                className="flex-1 h-10 px-3 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary"
                required
              />
              <button
                type="submit"
                disabled={saving}
                className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center gap-1"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Lista de lançamentos */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Lançamentos do período ({custos.length})</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Carregando...</div>
        ) : custos.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Nenhum custo lançado neste período</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background/50">
                <tr className="text-left text-[11px] text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Descrição</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {custos.map((c) => (
                  <tr key={c.id} className="border-t border-border hover:bg-background/30">
                    <td className="px-4 py-3 text-foreground">{new Date(c.data + "T00:00:00").toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium" style={{ backgroundColor: `${CAT_COLORS[c.categoria]}20`, color: CAT_COLORS[c.categoria] }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CAT_COLORS[c.categoria] }} />
                        {c.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.descricao || "-"}</td>
                    <td className="px-4 py-3 text-right text-foreground font-medium">{formatBRL(Number(c.valor))}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-muted-foreground hover:text-destructive transition p-1"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
