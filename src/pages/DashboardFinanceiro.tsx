import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Loader2, TrendingDown, TrendingUp, Wallet } from "lucide-react";
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

interface Receita {
  id: string;
  data: string;
  origem: string;
  descricao: string | null;
  valor: number;
}

const ORIGENS = ["Pix", "Transferência", "Dinheiro", "Cartão", "Boleto", "Outros"] as const;
type Origem = typeof ORIGENS[number];

const CAT_COLORS: Record<Categoria, string> = {
  Ferramentas: "hsl(270, 100%, 65%)",
  "Anúncios": "hsl(24, 95%, 53%)",
  Equipe: "hsl(217, 91%, 60%)",
  Infraestrutura: "hsl(142, 71%, 45%)",
  Outros: "hsl(0, 0%, 60%)",
};

const ORIGEM_COLOR = "hsl(142, 71%, 45%)";

export default function DashboardFinanceiro() {
  const { user } = useAuth();
  const [range, setRange] = useState<RangeFilterValue>({ preset: "30d" });
  const [custos, setCustos] = useState<Custo[]>([]);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingRec, setSavingRec] = useState(false);

  // form custo
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [categoria, setCategoria] = useState<Categoria>("Ferramentas");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");

  // form receita
  const [dataR, setDataR] = useState(new Date().toISOString().slice(0, 10));
  const [origem, setOrigem] = useState<Origem>("Pix");
  const [descricaoR, setDescricaoR] = useState("");
  const [valorR, setValorR] = useState("");

  const r = useMemo(() => getRange(range.preset, { from: range.from, to: range.to }), [range]);

  const fetchAll = async () => {
    setLoading(true);
    const fromStr = r.from.toISOString().slice(0, 10);
    const toStr = r.to.toISOString().slice(0, 10);
    const [{ data: cRows, error: cErr }, { data: rRows, error: rErr }] = await Promise.all([
      supabase.from("custos").select("*").gte("data", fromStr).lte("data", toStr).order("data", { ascending: false }),
      supabase.from("receitas").select("*").gte("data", fromStr).lte("data", toStr).order("data", { ascending: false }),
    ]);
    if (cErr) toast.error("Erro ao carregar custos");
    if (rErr) toast.error("Erro ao carregar receitas");
    setCustos((cRows as any) || []);
    setReceitas((rRows as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
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
    fetchAll();
  };

  const handleSubmitReceita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const v = parseFloat(valorR.replace(",", "."));
    if (isNaN(v) || v <= 0) {
      toast.error("Valor inválido");
      return;
    }
    setSavingRec(true);
    const { error } = await supabase.from("receitas").insert({
      data: dataR,
      origem,
      descricao: descricaoR || null,
      valor: v,
      created_by: user.id,
    });
    setSavingRec(false);
    if (error) {
      toast.error("Erro ao salvar receita");
      return;
    }
    toast.success("Receita lançada");
    setDescricaoR("");
    setValorR("");
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("custos").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir");
      return;
    }
    toast.success("Excluído");
    fetchAll();
  };

  const handleDeleteReceita = async (id: string) => {
    const { error } = await supabase.from("receitas").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir");
      return;
    }
    toast.success("Excluído");
    fetchAll();
  };

  const totalPorCategoria = useMemo(() => {
    const acc: Record<Categoria, number> = {
      Ferramentas: 0, "Anúncios": 0, Equipe: 0, Infraestrutura: 0, Outros: 0,
    };
    custos.forEach((c) => { acc[c.categoria] = (acc[c.categoria] || 0) + Number(c.valor); });
    return acc;
  }, [custos]);

  const total = useMemo(() => custos.reduce((s, c) => s + Number(c.valor), 0), [custos]);
  const totalReceitas = useMemo(() => receitas.reduce((s, c) => s + Number(c.valor), 0), [receitas]);
  const saldo = totalReceitas - total;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70 mb-1.5 font-light">Custos e receitas do período</p>
          <h1 className="text-3xl md:text-4xl font-extralight text-foreground tracking-tight">Financeiro</h1>
        </div>
        <RangeFilter value={range} onChange={setRange} />
      </div>

      {/* Resumo por categoria */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm p-4 col-span-2 md:col-span-1 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/60 to-transparent" />
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="h-3.5 w-3.5 text-red-400" strokeWidth={1.5} />
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-light">Total no período</p>
          </div>
          <p className="text-2xl font-extralight tracking-tight tabular-nums text-foreground">{formatBRL(total)}</p>
        </div>
        {CATEGORIAS.map((cat) => (
          <div key={cat} className="rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm p-4 relative overflow-hidden transition-all duration-300 hover:border-border hover:bg-card">
            <div className="absolute inset-x-0 top-0 h-px opacity-60" style={{ background: `linear-gradient(90deg, transparent, ${CAT_COLORS[cat]}, transparent)` }} />
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CAT_COLORS[cat], boxShadow: `0 0 8px ${CAT_COLORS[cat]}` }} />
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-light truncate">{cat}</p>
            </div>
            <p className="text-lg font-extralight tracking-tight tabular-nums text-foreground">{formatBRL(totalPorCategoria[cat])}</p>
          </div>
        ))}
      </div>

      {/* Form de lançamento */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm p-5 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <h3 className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80 mb-4 font-light">Lançar novo custo</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1.5 block font-light">Data</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-background/60 border border-border/60 text-sm text-foreground font-light focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1.5 block font-light">Categoria</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as Categoria)}
              className="w-full h-10 px-3 rounded-lg bg-background/60 border border-border/60 text-sm text-foreground font-light focus:outline-none focus:border-primary"
            >
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1.5 block font-light">Descrição (opcional)</label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Anúncio Facebook campanha X"
              className="w-full h-10 px-3 rounded-lg bg-background/60 border border-border/60 text-sm text-foreground font-light focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1.5 block font-light">Valor (R$)</label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                className="flex-1 h-10 px-3 rounded-lg bg-background/60 border border-border/60 text-sm text-foreground font-light focus:outline-none focus:border-primary"
                required
              />
              <button
                type="submit"
                disabled={saving}
                className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-light hover:opacity-90 transition disabled:opacity-50 flex items-center gap-1"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Lista de lançamentos */}
      <div className="rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="p-5 border-b border-border/40">
          <h3 className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80 font-light">Lançamentos do período ({custos.length})</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground/60 text-xs font-light">Carregando...</div>
        ) : custos.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground/60 text-xs font-light">Nenhum custo lançado neste período</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background/40">
                <tr className="text-left text-[10px] text-muted-foreground/70 uppercase tracking-wider font-light">
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Descrição</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {custos.map((c) => (
                  <tr key={c.id} className="border-t border-border/30 hover:bg-background/30 transition-colors">
                    <td className="px-4 py-3 text-foreground font-light tabular-nums">{new Date(c.data + "T00:00:00").toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-light" style={{ backgroundColor: `${CAT_COLORS[c.categoria]}18`, color: CAT_COLORS[c.categoria] }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CAT_COLORS[c.categoria] }} />
                        {c.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-light">{c.descricao || "-"}</td>
                    <td className="px-4 py-3 text-right text-foreground font-light tabular-nums">{formatBRL(Number(c.valor))}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-muted-foreground/60 hover:text-destructive transition p-1"
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
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
