import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, Plus, UserPlus, Download, Clock, DollarSign, Users, Columns3, Calendar } from "lucide-react";
import * as XLSX from "xlsx";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { RangeFilter, RangeFilterValue } from "@/components/dashboard/RangeFilter";
import { getRange, formatBRL } from "@/lib/dateRanges";
import { usePermissions } from "@/hooks/usePermissions";
import { useComprarLimite } from "@/hooks/useComprarLimite";


interface Assinante {
  id: string;
  nome: string;
  email: string;
  whatsapp?: string | null;
  produto: string;
  plano: string;
  status: string;
  valor: number;
  meio_pagamento: string;
  proxima_cobranca: string | null;
  data_criacao: string;
  data_renovacao: string | null;
  created_at?: string;
  created_by?: string | null;
}

interface AfiliadoInfo {
  user_id: string;
  display_name: string;
  email: string;
}

export default function DashboardAssinaturas() {
  const { user } = useAuth();
  const { permissions, loading: permsLoading } = usePermissions();
  const isAfiliado = permissions.is_afiliado;
  const isMaster = user?.email === "mandarrari@rataria.io";
  const [assinantes, setAssinantes] = useState<Assinante[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [produtoFilter, setProdutoFilter] = useState("all");
  const [origemFilter, setOrigemFilter] = useState<"all" | "naut" | "manual">("all");
  const [range, setRange] = useState<RangeFilterValue>({ preset: "7d" });

  const COLUMNS = [
    { key: "data_venda", label: "Data da venda" },
    { key: "assinante", label: "Assinante" },
    { key: "email", label: "E-mail" },
    { key: "whatsapp", label: "WhatsApp" },
    { key: "produto", label: "Produto" },
    { key: "status", label: "Status" },
    { key: "valor", label: "Valor" },
    { key: "data_criacao", label: "Criada em" },
    { key: "proxima_cobranca", label: "Próx. cobrança" },
    { key: "meio_pagamento", label: "Meio de Pagamento" },
  ] as const;
  type ColKey = typeof COLUMNS[number]["key"];
  const [visibleCols, setVisibleCols] = useState<Record<ColKey, boolean>>(() => {
    try {
      const saved = localStorage.getItem("assinaturas_cols_v1");
      if (saved) return JSON.parse(saved);
    } catch {}
    return COLUMNS.reduce((acc, c) => ({ ...acc, [c.key]: true }), {} as Record<ColKey, boolean>);
  });
  useEffect(() => {
    localStorage.setItem("assinaturas_cols_v1", JSON.stringify(visibleCols));
  }, [visibleCols]);
  const isVisible = (k: ColKey) => visibleCols[k];
  const r = useMemo(() => getRange(range.preset, { from: range.from, to: range.to }), [range]);

  // Retorna data atual no fuso de Brasília no formato YYYY-MM-DD
  const todayBR = () => {
    const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" });
    return fmt.format(new Date()); // en-CA produz YYYY-MM-DD
  };
  const addDaysBR = (baseISO: string, days: number) => {
    const [y, m, d] = baseISO.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() + days);
    return dt.toISOString().split("T")[0];
  };
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ativarDialogOpen, setAtivarDialogOpen] = useState(false);
  const [tempDialogOpen, setTempDialogOpen] = useState(false);
  const [form, setForm] = useState({
    nome: "", email: "", whatsapp: "", produto: "RatarIA", plano: "N/A", status: "Ativa",
    valor: "", meio_pagamento: "Cartão", proxima_cobranca: "", data_criacao: "", data_renovacao: ""
  });
  const [ativarForm, setAtivarForm] = useState({
    nome: "", email: "", whatsapp: "", plano: "mensal", data_inicio: todayBR()
  });
  const [tempForm, setTempForm] = useState({ nome: "", email: "", whatsapp: "" });
  const [duplicateInfo, setDuplicateInfo] = useState<Assinante | null>(null);

  const findExistingByEmail = (email: string): Assinante | null => {
    const e = email.trim().toLowerCase();
    if (!e) return null;
    return assinantes.find(a => (a.email || "").trim().toLowerCase() === e) ?? null;
  };

  const PLAN_CONFIG: Record<string, { days: number; label: string; valor: number }> = {
    semanal: { days: 7, label: "Semanal", valor: 39.99 },
    mensal: { days: 30, label: "Mensal", valor: 67 },
    semestral: { days: 180, label: "Semestral", valor: 497 },
  };

  const calcExpiration = (startDate: string, plan: string) => {
    return addDaysBR(startDate, PLAN_CONFIG[plan]?.days || 30);
  };

  const [afiliadosMap, setAfiliadosMap] = useState<Record<string, AfiliadoInfo>>({});

  const fetchAfiliadosMap = async (): Promise<Record<string, AfiliadoInfo>> => {
    if (isAfiliado) return {};
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return {};
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-team?action=list`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      if (!response.ok) return {};
      const data = await response.json();
      const map: Record<string, AfiliadoInfo> = {};
      (data.team || []).forEach((m: any) => {
        if (m.role !== "admin" && (m.permissions?.is_afiliado || m.permissions?.afiliados)) {
          map[m.id] = { user_id: m.id, display_name: m.display_name || m.email, email: m.email };
        }
      });
      return map;
    } catch { return {}; }
  };

  const fetchAll = async () => {
    setLoading(true);
    let query = supabase.from("assinantes").select("*").order("data_criacao", { ascending: false }).order("created_at", { ascending: false });
    if (isAfiliado && user) {
      query = query.eq("created_by", user.id);
    }
    const [{ data }, map] = await Promise.all([query, fetchAfiliadosMap()]);
    setAfiliadosMap(map);
    setAssinantes((data as any[]) ?? []);
    setLoading(false);
  };

  const fetchAssinantes = fetchAll;

  useEffect(() => {
    if (permsLoading) return;
    fetchAll();
  }, [isAfiliado, user?.id, permsLoading]);

  const [limitDialogOpen, setLimitDialogOpen] = useState(false);
  const { setOpen: setComprarLimiteOpen } = useComprarLimite();

  const isTempSub = (a: Assinante) =>
    (a.meio_pagamento || "").toLowerCase().includes("temporár") ||
    (a.plano || "").toLowerCase().includes("temporár");
  const usedCount = useMemo(() => assinantes.filter(a => !isTempSub(a)).length, [assinantes]);

  const checkAfiliadoLimit = (): boolean => {
    if (!isAfiliado) return true;
    const limit = permissions.max_assinaturas ?? 0;
    if (usedCount >= limit) {
      setLimitDialogOpen(true);
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!user || !form.nome || !form.email || !form.valor || !form.whatsapp) {
      toast.error("Preencha nome, email, WhatsApp e valor");
      return;
    }
    if (!checkAfiliadoLimit()) return;
    const existing = findExistingByEmail(form.email);
    if (existing) { setDuplicateInfo(existing); return; }
    let dataRenovacao = form.data_renovacao || null;
    if (isAfiliado && form.data_criacao) {
      const d = new Date(form.data_criacao);
      d.setDate(d.getDate() + 30);
      dataRenovacao = d.toISOString().slice(0, 10);
    }
    const { error } = await supabase.from("assinantes").insert({
      nome: form.nome, email: form.email, whatsapp: form.whatsapp,
      produto: isAfiliado ? "RatarIA" : form.produto,
      plano: isAfiliado ? "Mensal" : form.plano,
      status: form.status, valor: parseFloat(form.valor), meio_pagamento: form.meio_pagamento,
      proxima_cobranca: isAfiliado ? null : (form.proxima_cobranca || null),
      data_criacao: form.data_criacao || todayBR(),
      data_renovacao: dataRenovacao, created_by: user.id,
    } as any);
    if (error) { toast.error("Erro ao adicionar"); return; }
    toast.success("Assinante adicionado");
    setDialogOpen(false);
    setForm({ nome: "", email: "", whatsapp: "", produto: "RatarIA", plano: "N/A", status: "Ativa", valor: "", meio_pagamento: "Cartão", proxima_cobranca: "", data_criacao: "", data_renovacao: "" });
    fetchAssinantes();
  };

  const handleAtivarLogin = async () => {
    if (!user || !ativarForm.nome || !ativarForm.email || !ativarForm.whatsapp) {
      toast.error("Preencha nome, email e WhatsApp");
      return;
    }
    if (!checkAfiliadoLimit()) return;
    const existing = findExistingByEmail(ativarForm.email);
    if (existing) { setDuplicateInfo(existing); return; }
    const planoKey = isAfiliado ? "mensal" : ativarForm.plano;
    const config = PLAN_CONFIG[planoKey];
    const expiration = calcExpiration(ativarForm.data_inicio, planoKey);
    const nextCharge = expiration;

    const { error } = await supabase.from("assinantes").insert({
      nome: ativarForm.nome,
      email: ativarForm.email,
      whatsapp: ativarForm.whatsapp,
      produto: "RatarIA",
      plano: config.label,
      status: "Ativa",
      valor: config.valor,
      meio_pagamento: "Manual",
      data_criacao: ativarForm.data_inicio,
      proxima_cobranca: nextCharge,
      data_renovacao: expiration,
      created_by: user.id,
    } as any);

    if (error) { toast.error("Erro ao ativar login"); return; }
    toast.success(`Login ativado! Expira em ${new Date(expiration).toLocaleDateString("pt-BR")}`);
    setAtivarDialogOpen(false);
    setAtivarForm({ nome: "", email: "", whatsapp: "", plano: "mensal", data_inicio: todayBR() });
    fetchAssinantes();
  };

  const handleTempLogin = async () => {
    if (!user || !tempForm.nome || !tempForm.email || !tempForm.whatsapp) {
      toast.error("Preencha nome, email e WhatsApp");
      return;
    }
    // Logins temporários não consomem o limite do afiliado
    const existing = findExistingByEmail(tempForm.email);
    if (existing) { setDuplicateInfo(existing); return; }
    const today = todayBR();
    const { error } = await supabase.from("assinantes").insert({
      nome: tempForm.nome,
      email: tempForm.email,
      whatsapp: tempForm.whatsapp,
      produto: "RatarIA",
      plano: "Temporário (30min)",
      status: "Ativa",
      valor: 0,
      meio_pagamento: "Temporário",
      data_criacao: today,
      proxima_cobranca: today,
      data_renovacao: today,
      created_by: user.id,
    } as any);
    if (error) { toast.error("Erro ao criar login temporário"); return; }
    toast.success(`Login temporário criado! Expira em 30 minutos.`);
    setTempDialogOpen(false);
    setTempForm({ nome: "", email: "", whatsapp: "" });
    fetchAssinantes();
  };

  const handleDelete = async (a: Assinante) => {
    // Remove TODAS as linhas com o mesmo email+produto para que o cliente
    // possa ser cadastrado novamente sem disparar o aviso de "já cadastrado".
    const { error } = await supabase
      .from("assinantes")
      .delete()
      .eq("email", a.email)
      .eq("produto", a.produto);
    if (error) { toast.error("Erro ao remover"); return; }
    toast.success("Assinante removido");
    await fetchAssinantes();
  };

  const [extendDialog, setExtendDialog] = useState<{ open: boolean; sub: Assinante | null; days: string }>({ open: false, sub: null, days: "7" });

  const handleExtendDays = async () => {
    const sub = extendDialog.sub;
    const days = parseInt(extendDialog.days, 10);
    if (!sub || !days || days <= 0) { toast.error("Informe uma quantidade válida de dias"); return; }
    const baseISO = (sub.data_renovacao || sub.proxima_cobranca || todayBR()).slice(0, 10);
    // Se já expirou, soma a partir de hoje; senão, soma a partir da expiração atual
    const today = todayBR();
    const start = baseISO < today ? today : baseISO;
    const newExpiration = addDaysBR(start, days);
    const { error } = await supabase
      .from("assinantes")
      .update({
        data_renovacao: newExpiration,
        proxima_cobranca: newExpiration,
        status: "Ativa",
      })
      .eq("id", sub.id);
    if (error) { toast.error("Erro ao adicionar dias"); return; }
    toast.success(`+${days} dias. Nova expiração: ${formatDate(newExpiration)}`);
    setExtendDialog({ open: false, sub: null, days: "7" });
    fetchAssinantes();
  };

  const isManual = (a: Assinante) => a.meio_pagamento === "Manual" || a.meio_pagamento === "Temporário";

  const isTemp = (a: Assinante) =>
    (a.meio_pagamento || "").toLowerCase().includes("temporár") ||
    (a.plano || "").toLowerCase().includes("temporár");

  const filtered = useMemo(() => assinantes.filter(a => {
    if (isTemp(a)) return false;
    const matchSearch = a.nome.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const matchProduto = produtoFilter === "all" || a.produto === produtoFilter;
    const matchOrigem = origemFilter === "all" || (origemFilter === "manual" ? isManual(a) : !isManual(a));
    const created = a.data_criacao ? (() => {
      const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(a.data_criacao);
      return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(a.data_criacao);
    })() : null;
    const matchRange = isAfiliado || !created || (created >= r.from && created <= r.to);
    return matchSearch && matchStatus && matchProduto && matchOrigem && matchRange;
  }), [assinantes, search, statusFilter, produtoFilter, origemFilter, r.from, r.to]);

  const totalAtivasValor = useMemo(
    () => filtered.filter(a => a.status === "Ativa").reduce((s, a) => s + Number(a.valor || 0), 0),
    [filtered]
  );
  const totalAtivasCount = useMemo(
    () => filtered.filter(a => a.status === "Ativa").length,
    [filtered]
  );

  const produtos = [...new Set(assinantes.map(a => a.produto))];

  const formatDate = (d: string | null) => {
    if (!d) return "N/A";
    // Datas em formato YYYY-MM-DD: parsear manualmente para evitar shift de fuso (UTC->BR)
    const onlyDate = d.length >= 10 ? d.slice(0, 10) : d;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(onlyDate);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;
    // Fallback para timestamps completos
    return new Date(d).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  };

  const formatDateTime = (d: string | null | undefined) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return "—"; }
  };

  const formatCurrency = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  const handleExport = (format: "xlsx" | "xls") => {
    const rows = filtered.map(a => ({
      "Nome": a.nome,
      "Email": a.email,
      "Produto": a.produto,
      "Plano": a.plano || "N/A",
      "Status": a.status,
      "Valor": a.valor,
      "Meio de Pagamento": a.meio_pagamento || "N/A",
      "Próx. Cobrança": formatDate(a.proxima_cobranca),
      "Data Criação": formatDate(a.data_criacao),
      "Data Renovação": formatDate(a.data_renovacao),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Assinantes");
    XLSX.writeFile(wb, `assinantes.${format}`, { bookType: format === "xls" ? "xls" : "xlsx" });
    toast.success(`Exportado como .${format}`);
  };

  const statusStyle = (s: string) => {
    if (s === "Ativa") return { wrap: "border-emerald-500/60 bg-emerald-500/80 text-white", dot: "bg-white" };
    if (s === "Cancelada") return { wrap: "border-red-500/60 bg-red-500/80 text-white", dot: "bg-white" };
    if (s === "Pendente") return { wrap: "border-yellow-500/60 bg-yellow-500/80 text-white", dot: "bg-white" };
    return { wrap: "border-border bg-muted text-foreground", dot: "bg-muted-foreground" };
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assinaturas</h1>
          <p className="text-xs text-muted-foreground">Gerencie todos os assinantes da plataforma</p>
          {isAfiliado && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5">
                <Users className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">
                  Limite: <span className="text-primary">{usedCount}</span>/{permissions.max_assinaturas ?? 0}
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => setComprarLimiteOpen(true)}
                className="h-7 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Plus className="h-3 w-3 mr-1" /> Comprar limite
              </Button>
            </div>
          )}
        </div>
        {permsLoading ? <div className="flex gap-2 h-9" /> : <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2"><Columns3 className="h-4 w-4" /> Colunas</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Exibir colunas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {COLUMNS.map(c => (
                <DropdownMenuCheckboxItem
                  key={c.key}
                  checked={visibleCols[c.key]}
                  onCheckedChange={(v) => setVisibleCols(prev => ({ ...prev, [c.key]: !!v }))}
                  onSelect={(e) => e.preventDefault()}
                >
                  {c.label}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setVisibleCols(COLUMNS.reduce((acc, c) => ({ ...acc, [c.key]: true }), {} as any)); }}>
                Mostrar todas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2"><Download className="h-4 w-4" /> Exportar</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("xlsx")}>Exportar .xlsx</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("xls")}>Exportar .xls</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Ativar Login Dialog — oculto para afiliados */}
          <Dialog open={ativarDialogOpen} onOpenChange={setAtivarDialogOpen}>
            {!isAfiliado && <DialogTrigger asChild>
              <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700"><UserPlus className="h-4 w-4" /> Ativar Login</Button>
            </DialogTrigger>}
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Ativar Login de Usuário</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Nome</Label><Input value={ativarForm.nome} onChange={e => setAtivarForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome do cliente" /></div>
                <div><Label>E-mail</Label><Input type="email" value={ativarForm.email} onChange={e => setAtivarForm(f => ({ ...f, email: e.target.value }))} placeholder="email@exemplo.com" /></div>
                <div><Label>WhatsApp <span className="text-red-500">*</span></Label><Input value={ativarForm.whatsapp} onChange={e => setAtivarForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="(11) 99999-9999" /></div>
                <div><Label>Plano</Label>
                  <Select value={isAfiliado ? "mensal" : ativarForm.plano} onValueChange={v => setAtivarForm(f => ({ ...f, plano: v }))} disabled={isAfiliado}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {!isAfiliado && <SelectItem value="semanal">Semanal (7 dias) — R$ 39,99</SelectItem>}
                      <SelectItem value="mensal">Mensal (30 dias) — R$ 67</SelectItem>
                      {!isAfiliado && <SelectItem value="semestral">Semestral (180 dias) — R$ 497</SelectItem>}
                    </SelectContent>
                  </Select>
                  {isAfiliado && <p className="text-xs text-muted-foreground mt-1">Afiliados podem cadastrar apenas no plano Mensal.</p>}
                </div>
                <div><Label>Data de Início</Label><Input type="date" value={ativarForm.data_inicio} onChange={e => setAtivarForm(f => ({ ...f, data_inicio: e.target.value }))} /></div>
                <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                  <p><strong>Expira em:</strong> {ativarForm.data_inicio ? formatDate(calcExpiration(ativarForm.data_inicio, ativarForm.plano)) : "—"}</p>
                </div>
              </div>
              <Button onClick={handleAtivarLogin} className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700">Ativar Login</Button>
            </DialogContent>
          </Dialog>

          {isAfiliado && permissions.acesso_temp_30min && (
            <Dialog open={tempDialogOpen} onOpenChange={setTempDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-orange-500 hover:bg-orange-600 text-white">
                  <Clock className="h-4 w-4" /> Teste 30min
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Criar Login Temporário</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="rounded-lg border border-orange-500/40 bg-orange-500/10 p-3 text-xs text-orange-400">
                    Este acesso dura <strong>30 minutos</strong> e <strong>não consome seu limite</strong>.
                  </div>
                  <div><Label>Nome</Label><Input value={tempForm.nome} onChange={e => setTempForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome do cliente" /></div>
                  <div><Label>E-mail</Label><Input type="email" value={tempForm.email} onChange={e => setTempForm(f => ({ ...f, email: e.target.value }))} placeholder="email@exemplo.com" /></div>
                  <div><Label>WhatsApp <span className="text-red-500">*</span></Label><Input value={tempForm.whatsapp} onChange={e => setTempForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="(11) 99999-9999" /></div>
                </div>
                <Button onClick={handleTempLogin} className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white">
                  <Clock className="h-4 w-4 mr-2" /> Criar Acesso de 30 minutos
                </Button>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700"><Plus className="h-4 w-4" /> Novo Assinante</Button>
            </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Adicionar Assinante</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Nome</Label><Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} /></div>
              <div className="col-span-2"><Label>Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div className="col-span-2"><Label>WhatsApp <span className="text-red-500">*</span></Label><Input value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="(11) 99999-9999" /></div>
              <div><Label>Produto</Label><Input value={isAfiliado ? "RatarIA" : form.produto} onChange={e => setForm(f => ({ ...f, produto: e.target.value }))} disabled={isAfiliado} /></div>
              <div><Label>Plano</Label><Input value={isAfiliado ? "Mensal" : form.plano} onChange={e => setForm(f => ({ ...f, plano: e.target.value }))} disabled={isAfiliado} /></div>
              <div><Label>Valor</Label><Input type="number" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} /></div>
              <div><Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Ativa">Ativa</SelectItem><SelectItem value="Cancelada">Cancelada</SelectItem><SelectItem value="Pendente">Pendente</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Meio de Pagamento</Label>
                <Select value={form.meio_pagamento} onValueChange={v => setForm(f => ({ ...f, meio_pagamento: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Cartão">Cartão</SelectItem><SelectItem value="Pix">Pix</SelectItem><SelectItem value="Boleto">Boleto</SelectItem></SelectContent>
                </Select>
              </div>
              {!isAfiliado && <div><Label>Próx. Cobrança</Label><Input type="date" value={form.proxima_cobranca} onChange={e => setForm(f => ({ ...f, proxima_cobranca: e.target.value }))} /></div>}
              <div><Label>Data Criação</Label><Input type="date" value={form.data_criacao} onChange={e => {
                const v = e.target.value;
                setForm(f => {
                  const next: any = { ...f, data_criacao: v };
                  if (isAfiliado && v) {
                    const d = new Date(v);
                    d.setDate(d.getDate() + 30);
                    next.data_renovacao = d.toISOString().slice(0, 10);
                  }
                  return next;
                });
              }} /></div>
              {!isAfiliado && <div><Label>Data Renovação</Label><Input type="date" value={form.data_renovacao} onChange={e => setForm(f => ({ ...f, data_renovacao: e.target.value }))} /></div>}
            </div>
            <Button onClick={handleAdd} className="w-full mt-2">Salvar</Button>
          </DialogContent>
          </Dialog>
        </div>}
      </div>

      {/* Range Filter */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <RangeFilter value={range} onChange={setRange} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <DollarSign className="h-4 w-4" /> Valor de Assinaturas Ativas
          </div>
          <p className="text-2xl font-semibold text-foreground">{formatBRL(totalAtivasValor)}</p>
          <p className="text-xs text-muted-foreground mt-1">No período selecionado</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Users className="h-4 w-4" /> Assinaturas Ativas
          </div>
          <p className="text-2xl font-semibold text-foreground">{totalAtivasCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Filtro: {origemFilter === "all" ? "Todas" : origemFilter === "naut" ? "Naut" : "Manual"}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Users className="h-4 w-4" /> Total no Período
          </div>
          <p className="text-2xl font-semibold text-foreground">{filtered.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Considera todos os status</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou email..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={origemFilter} onValueChange={(v: any) => setOrigemFilter(v)}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Origem" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as origens</SelectItem>
            <SelectItem value="naut">Naut</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Todos os status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="Ativa">Ativa</SelectItem>
            <SelectItem value="Cancelada">Cancelada</SelectItem>
            <SelectItem value="Pendente">Pendente</SelectItem>
          </SelectContent>
        </Select>
        <Select value={produtoFilter} onValueChange={setProdutoFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Todos os produtos" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os produtos</SelectItem>
            {produtos.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              {isVisible("data_venda") && <TableHead className="text-muted-foreground">Data da venda</TableHead>}
              {isVisible("assinante") && <TableHead className="text-muted-foreground">Assinante</TableHead>}
              {isVisible("email") && <TableHead className="text-muted-foreground">E-mail</TableHead>}
              {isVisible("whatsapp") && <TableHead className="text-muted-foreground">WhatsApp</TableHead>}
              {isVisible("produto") && <TableHead className="text-muted-foreground">Produto</TableHead>}
              {isVisible("status") && <TableHead className="text-muted-foreground">Status</TableHead>}
              {isVisible("valor") && <TableHead className="text-muted-foreground">Valor</TableHead>}
              {isVisible("data_criacao") && <TableHead className="text-muted-foreground">Criada em</TableHead>}
              {isVisible("proxima_cobranca") && <TableHead className="text-muted-foreground">Próx. cobrança</TableHead>}
              {isVisible("meio_pagamento") && <TableHead className="text-muted-foreground">Meio de Pagamento</TableHead>}
              
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Carregando...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Nenhum assinante encontrado</TableCell></TableRow>
            ) : (
              filtered.map(a => (
                <TableRow key={a.id} className="border-border hover:bg-muted/30">
                  {isVisible("data_venda") && (
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/60 bg-primary/70 px-2.5 py-1 text-xs font-medium text-white whitespace-nowrap">
                        <Calendar className="h-3 w-3" />
                        {formatDateTime(a.created_at)}
                      </span>
                    </TableCell>
                  )}
                  {isVisible("assinante") && (
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-medium text-foreground">{a.nome}</p>
                          {a.created_by && afiliadosMap[a.created_by] && (
                            <span
                              className="inline-flex items-center rounded-full border border-orange-500/70 bg-orange-500/80 px-2 py-0.5 text-[10px] font-semibold text-white"
                              title={`Afiliado: ${afiliadosMap[a.created_by].display_name} (${afiliadosMap[a.created_by].email})`}
                            >
                              Afiliado
                            </span>
                          )}
                        </div>
                        
                        {a.created_by && afiliadosMap[a.created_by] && (
                          <p className="text-[10px] text-orange-300/80 mt-0.5">
                            por {afiliadosMap[a.created_by].display_name} · {afiliadosMap[a.created_by].email}
                          </p>
                        )}
                      </div>
                    </TableCell>
                  )}
                  {isVisible("email") && (
                    <TableCell>
                      <p className="text-xs text-foreground break-all">{a.email}</p>
                    </TableCell>
                  )}
                  {isVisible("whatsapp") && (
                    <TableCell>
                      {a.whatsapp ? (
                        <a
                          href={`https://wa.me/${(a.whatsapp || "").replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-emerald-400 hover:underline whitespace-nowrap"
                        >
                          {a.whatsapp}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  )}
                  {isVisible("produto") && (
                    <TableCell>
                      <p className="text-sm font-semibold text-foreground">{a.produto}</p>
                    </TableCell>
                  )}
                  {isVisible("status") && (
                    <TableCell>
                      {(() => {
                        const st = statusStyle(a.status);
                        return (
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${st.wrap}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                            {a.status}
                          </span>
                        );
                      })()}
                    </TableCell>
                  )}
                  {isVisible("valor") && (
                    <TableCell>
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(a.valor)}</p>
                      {(() => {
                        const p = (a.plano || "").toLowerCase();
                        let label: string | null = null;
                        if (p.includes("semanal")) label = "Semanal";
                        else if (p.includes("semestral")) label = "Semestral";
                        else if (p.includes("mensal")) label = "Mensal";
                        if (!label) return null;
                        return (
                          <span className="mt-1 inline-flex items-center rounded-full border border-purple-500/60 bg-purple-500/80 px-2 py-0.5 text-[11px] font-medium text-white">
                            {label}
                          </span>
                        );
                      })()}
                    </TableCell>
                  )}
                  {isVisible("data_criacao") && (
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/60 bg-emerald-500/80 px-2.5 py-1 text-xs font-medium text-white">
                        <Calendar className="h-3 w-3" />
                        {formatDate(a.data_criacao)}
                      </span>
                    </TableCell>
                  )}
                  {isVisible("proxima_cobranca") && (
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/60 bg-red-500/80 px-2.5 py-1 text-xs font-medium text-white">
                        <Calendar className="h-3 w-3" />
                        {formatDate(a.proxima_cobranca)}
                      </span>
                    </TableCell>
                  )}
                  {isVisible("meio_pagamento") && <TableCell className="text-sm text-muted-foreground">{a.meio_pagamento || "N/A"}</TableCell>}
                  
                  <TableCell>
                    {!isAfiliado && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded hover:bg-muted/50 text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isMaster && (
                            <DropdownMenuItem onClick={() => setExtendDialog({ open: true, sub: a, days: "7" })}>
                              Adicionar dias
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(a)}>Remover</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de limite de assinaturas */}
      <Dialog open={limitDialogOpen} onOpenChange={setLimitDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-500">{(permissions.max_assinaturas ?? 0) === 0 ? "Você ainda não tem limite" : "Limite de assinaturas atingido"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400">
              {(permissions.max_assinaturas ?? 0) === 0
                ? <>Para adicionar clientes você precisa <strong>comprar limite</strong> primeiro. Compre via PIX e libere automaticamente.</>
                : <>Você atingiu o limite de <strong>{permissions.max_assinaturas ?? 0}</strong> assinaturas. Compre mais limites via PIX e libere automaticamente.</>}
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-xs text-foreground">
              <p>Até 10 limites: <strong>R$ 45,00</strong> cada</p>
              <p>A partir de 11: <strong>R$ 40,00</strong> cada</p>
            </div>
            <Button
              onClick={() => { setLimitDialogOpen(false); setComprarLimiteOpen(true); }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Comprar mais limites via PIX
            </Button>
            <Button onClick={() => setLimitDialogOpen(false)} variant="outline" className="w-full">Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de e-mail já cadastrado */}
      <Dialog open={!!duplicateInfo} onOpenChange={(o) => !o && setDuplicateInfo(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Cliente já cadastrado</DialogTitle>
          </DialogHeader>
          {duplicateInfo && (
            <div className="space-y-3">
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                Este e-mail já possui uma assinatura registrada. Veja os dados abaixo antes de criar um novo cadastro.
              </div>
              <div className="rounded-lg border border-border bg-muted/20 divide-y divide-border text-sm">
                {[
                  ["Nome", duplicateInfo.nome],
                  ["E-mail", duplicateInfo.email],
                  ["Produto", duplicateInfo.produto],
                  ["Plano", duplicateInfo.plano || "N/A"],
                  ["Status", duplicateInfo.status],
                  ["Valor", formatCurrency(Number(duplicateInfo.valor || 0))],
                  ["Meio de pagamento", duplicateInfo.meio_pagamento || "N/A"],
                  ["Data de criação", formatDate(duplicateInfo.data_criacao)],
                  ["Próx. cobrança", formatDate(duplicateInfo.proxima_cobranca)],
                  ["Renovação", formatDate(duplicateInfo.data_renovacao)],
                ].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between gap-3 px-3 py-2">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium text-foreground text-right">{v as string}</span>
                  </div>
                ))}
              </div>
              <Button onClick={() => setDuplicateInfo(null)} className="w-full" variant="outline">Fechar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Dialog de adicionar dias */}
      <Dialog open={extendDialog.open} onOpenChange={(o) => setExtendDialog(s => ({ ...s, open: o }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar dias ao acesso</DialogTitle>
          </DialogHeader>
          {extendDialog.sub && (
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                <p><strong className="text-foreground">{extendDialog.sub.nome}</strong> · {extendDialog.sub.email}</p>
                <p className="mt-1">Expiração atual: <strong className="text-foreground">{formatDate(extendDialog.sub.data_renovacao || extendDialog.sub.proxima_cobranca)}</strong></p>
              </div>
              <div>
                <Label>Dias adicionais</Label>
                <Input
                  type="number"
                  min={1}
                  value={extendDialog.days}
                  onChange={e => setExtendDialog(s => ({ ...s, days: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                {[7, 15, 30, 60, 90].map(d => (
                  <Button key={d} type="button" size="sm" variant="outline" onClick={() => setExtendDialog(s => ({ ...s, days: String(d) }))}>
                    +{d}
                  </Button>
                ))}
              </div>
              <Button onClick={handleExtendDays} className="w-full bg-emerald-600 hover:bg-emerald-700">
                Adicionar dias
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
