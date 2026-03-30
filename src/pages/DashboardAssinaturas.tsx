import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, Plus, UserPlus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    nome: "", email: "", produto: "RatarIA", plano: "N/A", status: "Ativa",
    valor: "", meio_pagamento: "Cartão", proxima_cobranca: "", data_criacao: "", data_renovacao: ""
  });

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

  const handleDelete = async (id: string) => {
    await supabase.from("assinantes").delete().eq("id", id);
    toast.success("Assinante removido");
    fetchAssinantes();
  };

  const filtered = assinantes.filter(a => {
    const matchSearch = a.nome.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const matchProduto = produtoFilter === "all" || a.produto === produtoFilter;
    return matchSearch && matchStatus && matchProduto;
  });

  const produtos = [...new Set(assinantes.map(a => a.produto))];

  const formatDate = (d: string | null) => {
    if (!d) return "N/A";
    const date = new Date(d);
    return date.toLocaleDateString("pt-BR");
  };

  const formatCurrency = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Novo Assinante</Button>
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

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou email..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
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
              <TableHead className="text-muted-foreground">Assinante</TableHead>
              <TableHead className="text-muted-foreground">Produto</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Valor</TableHead>
              <TableHead className="text-muted-foreground">Próx. cobrança</TableHead>
              <TableHead className="text-muted-foreground">Criada em</TableHead>
              <TableHead className="text-muted-foreground">Meio de Pagamento</TableHead>
              <TableHead className="text-muted-foreground">Data de Renovação</TableHead>
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
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-foreground">{a.nome}</p>
                      <p className="text-xs text-muted-foreground">{a.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-semibold text-foreground">{a.produto}</p>
                    <p className="text-xs text-muted-foreground">{a.plano}</p>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColor(a.status)}>{a.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(a.valor)}</p>
                    <p className="text-xs text-muted-foreground">N/A</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(a.proxima_cobranca)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(a.data_criacao)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{a.meio_pagamento || "N/A"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(a.data_renovacao)}</TableCell>
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
