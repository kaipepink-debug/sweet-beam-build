import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Handshake, Plus, Trash2, UserCheck, X, DollarSign, History, Search, Clock } from "lucide-react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RangeFilter, RangeFilterValue } from "@/components/dashboard/RangeFilter";
import { getRange } from "@/lib/dateRanges";

const createAfiliadoSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(8, "Mínimo 8 caracteres").max(72),
  displayName: z.string().trim().min(1, "Nome é obrigatório").max(100),
});

interface AfiliadoMember {
  id: string;
  email: string;
  display_name: string;
  role: string;
  permissions: Record<string, any> | null;
  created_at: string;
}

interface LimiteHistorico {
  id: string;
  afiliado_id: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  created_at: string;
}

const MIN_PURCHASE = 1;
const PRICE_LOW = 45; // < 10 (inclui acessos unitários)
const PRICE_HIGH = 40; // >= 10

const calcUnitPrice = (qty: number) => (qty >= 10 ? PRICE_HIGH : PRICE_LOW);

const AFILIADO_PERMISSIONS = {
  dashboard: false,
  financeiro: false,
  vendas: false,
  assinaturas: true,
  clientes: false,
  email_acesso: false,
  ferramentas_ia: false,
  gerar_avisos: false,
  acesso_clientes: false,
  pixels: false,
  analytics: false,
  configuracoes: false,
  equipe: false,
  is_afiliado: true,
  max_assinaturas: 0,
};

export default function DashboardAfiliados() {
  const [afiliados, setAfiliados] = useState<AfiliadoMember[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [allHistory, setAllHistory] = useState<LimiteHistorico[]>([]);
  const [search, setSearch] = useState("");
  const [range, setRange] = useState<RangeFilterValue>({ preset: "max" });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [initialQty, setInitialQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [purchaseDialog, setPurchaseDialog] = useState<{ open: boolean; member: AfiliadoMember | null; qty: number }>({ open: false, member: null, qty: 1 });
  const [historyDialog, setHistoryDialog] = useState<{ open: boolean; member: AfiliadoMember | null; rows: LimiteHistorico[] }>({ open: false, member: null, rows: [] });

  const { toast } = useToast();

  const formatBRL = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  const fetchAfiliados = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-team?action=list`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const onlyAfiliados = (data.team || []).filter(
        (m: AfiliadoMember) => m.permissions?.is_afiliado === true
      );
      setAfiliados(onlyAfiliados);

      const ids = onlyAfiliados.map((m: AfiliadoMember) => m.id);
      if (ids.length > 0) {
        const [{ data: assinantes }, { data: hist }] = await Promise.all([
          supabase.from("assinantes").select("created_by, plano, meio_pagamento").in("created_by", ids),
          supabase.from("afiliado_limite_historico" as any).select("*").in("afiliado_id", ids),
        ]);
        const isTemp = (a: any) =>
          (a.meio_pagamento || "").toLowerCase().includes("temporár") ||
          (a.plano || "").toLowerCase().includes("temporár");
        const cmap: Record<string, number> = {};
        (assinantes || []).forEach((a: any) => {
          if (a.created_by && !isTemp(a)) cmap[a.created_by] = (cmap[a.created_by] || 0) + 1;
        });
        setCounts(cmap);

        setAllHistory((hist as any) || []);
      } else {
        setAllHistory([]);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAfiliados();
  }, [fetchAfiliados]);

  const handleCreate = async () => {
    const result = createAfiliadoSchema.safeParse({ email, password, displayName });
    if (!result.success) {
      toast({ title: "Erro", description: result.error.errors[0].message, variant: "destructive" });
      return;
    }
    if (initialQty < MIN_PURCHASE) {
      toast({ title: "Erro", description: `Mínimo de ${MIN_PURCHASE} assinaturas.`, variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-team?action=create`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session!.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: result.data.email,
          password: result.data.password,
          display_name: result.data.displayName,
          permissions: { ...AFILIADO_PERMISSIONS, max_assinaturas: initialQty },
        }),
      }
    );

    const data = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      toast({ title: "Erro", description: data.error, variant: "destructive" });
      return;
    }

    // Registrar histórico inicial
    const unit = calcUnitPrice(initialQty);
    const newId = data.user?.id;
    if (newId) {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("afiliado_limite_historico" as any).insert({
        afiliado_id: newId,
        quantidade: initialQty,
        valor_unitario: unit,
        valor_total: unit * initialQty,
        created_by: user!.id,
      });
    }

    toast({ title: "Afiliado adicionado!", className: "bg-green-600 text-white border-green-600" });
    setEmail(""); setPassword(""); setDisplayName(""); setInitialQty(1);
    setShowForm(false);
    fetchAfiliados();
  };

  const handlePurchase = async () => {
    const m = purchaseDialog.member;
    const qty = purchaseDialog.qty;
    if (!m || qty < MIN_PURCHASE) {
      toast({ title: "Erro", description: `Mínimo de ${MIN_PURCHASE} assinaturas por compra.`, variant: "destructive" });
      return;
    }
    const currentLimit = m.permissions?.max_assinaturas ?? 0;
    const newLimit = currentLimit + qty;
    const unit = calcUnitPrice(qty);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-team?action=update-permissions`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: m.id, permissions: { max_assinaturas: newLimit } }),
      }
    );
    if (!response.ok) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("afiliado_limite_historico" as any).insert({
      afiliado_id: m.id,
      quantidade: qty,
      valor_unitario: unit,
      valor_total: unit * qty,
      created_by: user!.id,
    });

    toast({ title: `+${qty} adicionados · ${formatBRL(unit * qty)}`, className: "bg-green-600 text-white border-green-600" });
    setPurchaseDialog({ open: false, member: null, qty: 1 });
    fetchAfiliados();
  };

  const toggleAcessoTemp = async (m: AfiliadoMember) => {
    const current = m.permissions?.acesso_temp_30min === true;
    const next = !current;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-team?action=update-permissions`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: m.id, permissions: { acesso_temp_30min: next } }),
      }
    );
    if (!response.ok) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
      return;
    }
    toast({ title: next ? "Acesso 30min liberado" : "Acesso 30min bloqueado", className: next ? "bg-green-600 text-white border-green-600" : undefined });
    fetchAfiliados();
  };

  const openHistory = async (m: AfiliadoMember) => {
    const { data } = await supabase
      .from("afiliado_limite_historico" as any)
      .select("*")
      .eq("afiliado_id", m.id)
      .order("created_at", { ascending: false });
    setHistoryDialog({ open: true, member: m, rows: (data as any) || [] });
  };

  const handleRemove = async (userId: string, memberName: string) => {
    if (!confirm(`Remover o afiliado "${memberName}"? As assinaturas que ele cadastrou serão preservadas.`)) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-team?action=remove`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId, preserve_assinantes: true }),
      }
    );
    if (response.ok) {
      toast({ title: "Afiliado removido", className: "bg-green-600 text-white border-green-600" });
      fetchAfiliados();
    } else {
      toast({ title: "Erro ao remover", variant: "destructive" });
    }
  };

  const r = useMemo(() => getRange(range.preset, { from: range.from, to: range.to }), [range]);

  const filteredHistory = useMemo(() => {
    return allHistory.filter((h) => {
      const d = new Date(h.created_at);
      return d >= r.from && d <= r.to;
    });
  }, [allHistory, r.from, r.to]);

  const revenueByAfiliado = useMemo(() => {
    const map: Record<string, number> = {};
    filteredHistory.forEach((h) => {
      map[h.afiliado_id] = (map[h.afiliado_id] || 0) + Number(h.valor_total);
    });
    return map;
  }, [filteredHistory]);

  const totalRevenue = Object.values(revenueByAfiliado).reduce((s, v) => s + v, 0);

  const filteredAfiliados = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return afiliados;
    return afiliados.filter(
      (m) =>
        (m.display_name || "").toLowerCase().includes(q) ||
        (m.email || "").toLowerCase().includes(q)
    );
  }, [afiliados, search]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Gerencie seus afiliados</p>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Afiliados</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancelar" : "Novo Afiliado"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Receita Total</p>
          <p className="text-xl font-bold text-emerald-400">{formatBRL(totalRevenue)}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Preço por slot</p>
          <p className="text-xs text-foreground">Unitário / Lote &lt; 10 → <strong className="text-primary">R$ 45</strong> · Lote ≥ 10 → <strong className="text-primary">R$ 40</strong></p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Mínimo {MIN_PURCHASE} por compra (acessos unitários permitidos)</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Afiliados ativos</p>
          <p className="text-xl font-bold text-foreground">{afiliados.length}</p>
        </div>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-primary" />
            Adicionar Afiliado
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Nome</label>
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm bg-muted border border-border text-foreground outline-none focus:border-primary transition-colors" placeholder="Nome do afiliado" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm bg-muted border border-border text-foreground outline-none focus:border-primary transition-colors" placeholder="afiliado@exemplo.com" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Senha</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm bg-muted border border-border text-foreground outline-none focus:border-primary transition-colors" placeholder="Mínimo 8 caracteres" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Limite inicial (mín. {MIN_PURCHASE})</label>
              <input type="number" min={MIN_PURCHASE} value={initialQty} onChange={(e) => setInitialQty(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 rounded-xl text-sm bg-muted border border-border text-foreground outline-none focus:border-primary transition-colors" />
              <p className="text-[10px] text-emerald-400 mt-1">{initialQty >= MIN_PURCHASE ? `${initialQty} × ${formatBRL(calcUnitPrice(initialQty))} = ${formatBRL(initialQty * calcUnitPrice(initialQty))}` : `Mínimo ${MIN_PURCHASE}`}</p>
            </div>
          </div>

          <button onClick={handleCreate} disabled={submitting} className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            {submitting ? "Criando..." : "Adicionar Afiliado"}
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm bg-muted border border-border text-foreground outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-1">Período da receita</span>
          <RangeFilter value={range} onChange={setRange} />
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredAfiliados.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <Handshake className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{afiliados.length === 0 ? "Nenhum afiliado cadastrado" : "Nenhum afiliado encontrado"}</p>
          </div>
        ) : (
          filteredAfiliados.map((member) => {
            const limit = member.permissions?.max_assinaturas ?? 0;
            const used = counts[member.id] || 0;
            const revenue = revenueByAfiliado[member.id] || 0;
            return (
              <div key={member.id} className="rounded-2xl border border-border bg-card p-5 purple-hover-glow">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Handshake className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{member.display_name || member.email}</p>
                      <p className="text-[10px] text-muted-foreground">{member.email}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Afiliado</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-muted/30 px-3 py-2 min-w-[100px]">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Uso</span>
                      <span className="text-sm font-semibold text-foreground"><span className="text-foreground">{used}</span><span className="text-muted-foreground"> / </span><span className="text-primary">{limit}</span></span>
                    </div>

                    <div className="flex flex-col items-center gap-0.5 rounded-xl border border-emerald-500/60 bg-emerald-500/80 px-3 py-2 min-w-[120px]">
                      <span className="text-[10px] uppercase tracking-wider text-white/90">Receita gerada</span>
                      <span className="text-sm font-bold text-white">{formatBRL(revenue)}</span>
                    </div>

                    <button
                      onClick={() => setPurchaseDialog({ open: true, member, qty: MIN_PURCHASE })}
                      className="flex items-center gap-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-3 py-2 text-xs font-semibold transition-colors"
                      title="Adicionar slots"
                    >
                      <Plus className="h-3.5 w-3.5" /> Slots
                    </button>

                    <button
                      onClick={() => openHistory(member)}
                      className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 text-foreground px-3 py-2 text-xs font-semibold transition-colors"
                      title="Histórico"
                    >
                      <History className="h-3.5 w-3.5" /> Histórico
                    </button>

                    <button
                      onClick={() => handleRemove(member.id, member.display_name || member.email)}
                      className="text-destructive/60 hover:text-destructive transition-colors p-2"
                      title="Remover afiliado"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dialog de compra de slots */}
      <Dialog open={purchaseDialog.open} onOpenChange={(o) => !o && setPurchaseDialog({ open: false, member: null, qty: MIN_PURCHASE })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar slots para {purchaseDialog.member?.display_name || purchaseDialog.member?.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Quantidade (mín. {MIN_PURCHASE})</label>
              <input
                type="number"
                min={MIN_PURCHASE}
                value={purchaseDialog.qty}
                onChange={(e) => setPurchaseDialog((p) => ({ ...p, qty: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 rounded-xl text-base bg-muted border border-border text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-1">
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Preço por slot</span><span className="font-semibold text-foreground">{formatBRL(calcUnitPrice(purchaseDialog.qty))}</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Quantidade</span><span className="font-semibold text-foreground">{purchaseDialog.qty}</span></div>
              <div className="flex justify-between text-sm pt-1 border-t border-emerald-500/30 mt-1"><span className="text-emerald-300">Total a receber</span><span className="font-bold text-emerald-400">{formatBRL(calcUnitPrice(purchaseDialog.qty) * purchaseDialog.qty)}</span></div>
            </div>

            <p className="text-[10px] text-muted-foreground">Limite atual: <strong>{purchaseDialog.member?.permissions?.max_assinaturas ?? 0}</strong> → Novo limite: <strong className="text-primary">{(purchaseDialog.member?.permissions?.max_assinaturas ?? 0) + purchaseDialog.qty}</strong></p>

            <button onClick={handlePurchase} className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              <DollarSign className="h-4 w-4" /> Confirmar compra
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Histórico */}
      <Dialog open={historyDialog.open} onOpenChange={(o) => !o && setHistoryDialog({ open: false, member: null, rows: [] })}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Histórico — {historyDialog.member?.display_name || historyDialog.member?.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {historyDialog.rows.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-6">Sem registros</p>
            ) : (
              historyDialog.rows.map((h) => (
                <div key={h.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-foreground">+{h.quantidade} slots</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(h.created_at).toLocaleString("pt-BR")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">{formatBRL(Number(h.valor_total))}</p>
                    <p className="text-[10px] text-muted-foreground">{formatBRL(Number(h.valor_unitario))}/slot</p>
                  </div>
                </div>
              ))
            )}
            {historyDialog.rows.length > 0 && (
              <div className="flex justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 mt-2">
                <span className="text-sm font-semibold text-emerald-300">Total</span>
                <span className="text-sm font-bold text-emerald-400">{formatBRL(historyDialog.rows.reduce((s, h) => s + Number(h.valor_total), 0))}</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
