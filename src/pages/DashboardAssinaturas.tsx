import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, Plus, UserPlus, Download, Clock, DollarSign, Users, Columns3 } from "lucide-react";
import * as XLSX from "xlsx";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { RangeFilter, RangeFilterValue } from "@/components/dashboard/RangeFilter";
import { getRange, formatBRL } from "@/lib/dateRanges";

interface Assinante {
  id: string;
  nome: string;
  email: string;
  produto: string;
  plano: string;
  status: string;
  valor: number;
  meio_pagamento: string;
  proxima_cobranca: string | null;
  data_criacao: string;
  data_renovacao: string | null;
}

export default function DashboardAssinaturas() {
  const { user } = useAuth();
  const [assinantes, setAssinantes] = useState<Assinante[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [produtoFilter, setProdutoFilter] = useState("all");
  const [origemFilter, setOrigemFilter] = useState<"all" | "naut" | "manual">("all");
  const [range, setRange] = useState<RangeFilterValue>({ preset: "30d" });

  const COLUMNS = [
    { key: "assinante", label: "Assinante" },
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ativarDialogOpen, setAtivarDialogOpen] = useState(false);
  const [tempDialogOpen, setTempDialogOpen] = useState(false);
  const [form, setForm] = useState({
    nome: "", email: "", produto: "RatarIA", plano: "N/A", status: "Ativa",
    valor: "", meio_pagamento: "Cartão", proxima_cobranca: "", data_criacao: "", data_renovacao: ""
  });
  const [ativarForm, setAtivarForm] = useState({
    nome: "", email: "", plano: "mensal", data_inicio: new Date().toISOString().split("T")[0]
  });
  const [tempForm, setTempForm] = useState({ nome: "", email: "" });

  const PLAN_CONFIG: Record<string, { days: number; label: string; valor: number }> = {
    semanal: { days: 7, label: "Semanal", valor: 39.99 },
    mensal: { days: 30, label: "Mensal", valor: 67 },
    semestral: { days: 180, label: "Semestral", valor: 497 },
  };

  const calcExpiration = (startDate: string, plan: string) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + (PLAN_CONFIG[plan]?.days || 30));
    return date.toISOString().split("T")[0];
  };

  const fetchAssinantes = async () => {
    const { data } = await supabase.from("assinantes").select("*").order("created_at", { ascending: false });
    setAssinantes((data as any[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchAssinantes(); }, []);

  const handleAdd = async () => {
    if (!user || !form.nome || !form.email || !form.valor) {
      toast.error("Preencha nome, email e valor");
      return;
    }
    const { error } = await supabase.from("assinantes").insert({
      nome: form.nome, email: form.email, produto: form.produto, plano: form.plano,
      status: form.status, valor: parseFloat(form.valor), meio_pagamento: form.meio_pagamento,
      proxima_cobranca: form.proxima_cobranca || null, data_criacao: form.data_criacao || new Date().toISOString().split("T")[0],
      data_renovacao: form.data_renovacao || null, created_by: user.id,
    } as any);
    if (error) { toast.error("Erro ao adicionar"); return; }
    toast.success("Assinante adicionado");
    setDialogOpen(false);
    setForm({ nome: "", email: "", produto: "RatarIA", plano: "N/A", status: "Ativa", valor: "", meio_pagamento: "Cartão", proxima_cobranca: "", data_criacao: "", data_renovacao: "" });
    fetchAssinantes();
  };

  const handleAtivarLogin = async () => {
    if (!user || !ativarForm.nome || !ativarForm.email) {
      toast.error("Preencha nome e email");
      return;
    }
    const config = PLAN_CONFIG[ativarForm.plano];
    const expiration = calcExpiration(ativarForm.data_inicio, ativarForm.plano);
    const nextCharge = expiration;

    const { error } = await supabase.from("assinantes").insert({
      nome: ativarForm.nome,
      email: ativarForm.email,
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
    setAtivarForm({ nome: "", email: "", plano: "mensal", data_inicio: new Date().toISOString().split("T")[0] });
    fetchAssinantes();
  };

  const handleTempLogin = async () => {
    if (!user || !tempForm.nome || !tempForm.email) {
      toast.error("Preencha nome e email");
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    const { error } = await supabase.from("assinantes").insert({
      nome: tempForm.nome,
      email: tempForm.email,
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
    setTempForm({ nome: "", email: "" });
    fetchAssinantes();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("assinantes").delete().eq("id", id);
    toast.success("Assinante removido");
    fetchAssinantes();
  };

  const isManual = (a: Assinante) => a.meio_pagamento === "Manual" || a.meio_pagamento === "Temporário";

  const filtered = useMemo(() => assinantes.filter(a => {
    const matchSearch = a.nome.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const matchProduto = produtoFilter === "all" || a.produto === produtoFilter;
    const matchOrigem = origemFilter === "all" || (origemFilter === "manual" ? isManual(a) : !isManual(a));
    const created = a.data_criacao ? new Date(a.data_criacao) : null;
    const matchRange = !created || (created >= r.from && created <= r.to);
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
    const date = new Date(d);
    return date.toLocaleDateString("pt-BR");
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

  const statusColor = (s: string) => {
    if (s === "Ativa") return "bg-emerald-600 text-white hover:bg-emerald-700";
    if (s === "Cancelada") return "bg-red-600 text-white hover:bg-red-700";
    if (s === "Pendente") return "bg-yellow-600 text-white hover:bg-yellow-700";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assinaturas</h1>
          <p className="text-xs text-muted-foreground">Gerencie todos os assinantes da plataforma</p>
        </div>
        <div className="flex gap-2">
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
          {/* Ativar Login Dialog */}
          <Dialog open={ativarDialogOpen} onOpenChange={setAtivarDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700"><UserPlus className="h-4 w-4" /> Ativar Login</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Ativar Login de Usuário</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Nome</Label><Input value={ativarForm.nome} onChange={e => setAtivarForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome do cliente" /></div>
                <div><Label>E-mail</Label><Input type="email" value={ativarForm.email} onChange={e => setAtivarForm(f => ({ ...f, email: e.target.value }))} placeholder="email@exemplo.com" /></div>
                <div><Label>Plano</Label>
                  <Select value={ativarForm.plano} onValueChange={v => setAtivarForm(f => ({ ...f, plano: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semanal">Semanal (7 dias) — R$ 39,99</SelectItem>
                      <SelectItem value="mensal">Mensal (30 dias) — R$ 67</SelectItem>
                      <SelectItem value="semestral">Semestral (180 dias) — R$ 497</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Data de Início</Label><Input type="date" value={ativarForm.data_inicio} onChange={e => setAtivarForm(f => ({ ...f, data_inicio: e.target.value }))} /></div>
                <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                  <p><strong>Expira em:</strong> {ativarForm.data_inicio ? new Date(calcExpiration(ativarForm.data_inicio, ativarForm.plano)).toLocaleDateString("pt-BR") : "—"}</p>
                </div>
              </div>
              <Button onClick={handleAtivarLogin} className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700">Ativar Login</Button>
            </DialogContent>
          </Dialog>

          {/* Login Temporário (30 min) */}
          <Dialog open={tempDialogOpen} onOpenChange={setTempDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 bg-amber-600 hover:bg-amber-700 text-white">
                <Clock className="h-4 w-4" /> Login Temporário (30min)
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Login Temporário</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="rounded-lg border border-amber-600/30 bg-amber-600/10 p-3 text-xs text-amber-200">
                  <p>⏱️ Este acesso dura apenas <strong>30 minutos</strong>. Após esse período, o usuário será expirado automaticamente e precisará assinar um plano para continuar.</p>
                </div>
                <div><Label>Nome</Label><Input value={tempForm.nome} onChange={e => setTempForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome do cliente" /></div>
                <div><Label>E-mail</Label><Input type="email" value={tempForm.email} onChange={e => setTempForm(f => ({ ...f, email: e.target.value }))} placeholder="email@exemplo.com" /></div>
              </div>
              <Button onClick={handleTempLogin} className="w-full mt-2 bg-amber-600 hover:bg-amber-700 text-white">
                <Clock className="h-4 w-4 mr-2" /> Criar Acesso de 30 minutos
              </Button>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2"><Plus className="h-4 w-4" /> Novo Assinante</Button>
            </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Adicionar Assinante</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Nome</Label><Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} /></div>
              <div className="col-span-2"><Label>Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div><Label>Produto</Label><Input value={form.produto} onChange={e => setForm(f => ({ ...f, produto: e.target.value }))} /></div>
              <div><Label>Plano</Label><Input value={form.plano} onChange={e => setForm(f => ({ ...f, plano: e.target.value }))} /></div>
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
              <div><Label>Próx. Cobrança</Label><Input type="date" value={form.proxima_cobranca} onChange={e => setForm(f => ({ ...f, proxima_cobranca: e.target.value }))} /></div>
              <div><Label>Data Criação</Label><Input type="date" value={form.data_criacao} onChange={e => setForm(f => ({ ...f, data_criacao: e.target.value }))} /></div>
              <div><Label>Data Renovação</Label><Input type="date" value={form.data_renovacao} onChange={e => setForm(f => ({ ...f, data_renovacao: e.target.value }))} /></div>
            </div>
            <Button onClick={handleAdd} className="w-full mt-2">Salvar</Button>
          </DialogContent>
          </Dialog>
        </div>
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
              {isVisible("assinante") && <TableHead className="text-muted-foreground">Assinante</TableHead>}
              {isVisible("produto") && <TableHead className="text-muted-foreground">Produto</TableHead>}
              {isVisible("status") && <TableHead className="text-muted-foreground">Status</TableHead>}
              {isVisible("valor") && <TableHead className="text-muted-foreground">Valor</TableHead>}
              {isVisible("proxima_cobranca") && <TableHead className="text-muted-foreground">Próx. cobrança</TableHead>}
              {isVisible("data_criacao") && <TableHead className="text-muted-foreground">Criada em</TableHead>}
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
                  {isVisible("assinante") && (
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-foreground">{a.nome}</p>
                        <p className="text-xs text-muted-foreground">{a.email}</p>
                      </div>
                    </TableCell>
                  )}
                  {isVisible("produto") && (
                    <TableCell>
                      <p className="text-sm font-semibold text-foreground">{a.produto}</p>
                      <p className="text-xs text-muted-foreground">{a.plano}</p>
                    </TableCell>
                  )}
                  {isVisible("status") && (
                    <TableCell>
                      <Badge className={statusColor(a.status)}>{a.status}</Badge>
                    </TableCell>
                  )}
                  {isVisible("valor") && (
                    <TableCell>
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(a.valor)}</p>
                      <p className="text-xs text-muted-foreground">N/A</p>
                    </TableCell>
                  )}
                  {isVisible("proxima_cobranca") && <TableCell className="text-sm text-muted-foreground">{formatDate(a.proxima_cobranca)}</TableCell>}
                  {isVisible("data_criacao") && <TableCell className="text-sm text-muted-foreground">{formatDate(a.data_criacao)}</TableCell>}
                  {isVisible("meio_pagamento") && <TableCell className="text-sm text-muted-foreground">{a.meio_pagamento || "N/A"}</TableCell>}
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded hover:bg-muted/50 text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(a.id)}>Remover</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
