import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, Plus, Search, Trash2, Calendar, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
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
  data_criacao: string;
  created_at?: string;
  created_by?: string | null;
}

const isTemp = (a: Assinante) =>
  (a.meio_pagamento || "").toLowerCase().includes("temporár") ||
  (a.plano || "").toLowerCase().includes("temporár");

interface AfiliadoInfo { user_id: string; display_name: string; email: string; }

export default function DashboardVerificacaoLogin() {
  const { user } = useAuth();
  const { permissions, loading: permsLoading } = usePermissions();
  const isAfiliado = permissions.is_afiliado;
  const [items, setItems] = useState<Assinante[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "" });
  const [afiliadosMap, setAfiliadosMap] = useState<Record<string, AfiliadoInfo>>({});

  const todayBR = () => {
    const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" });
    return fmt.format(new Date());
  };

  const fetchItems = async () => {
    setLoading(true);
    let query = supabase.from("assinantes").select("*").order("created_at", { ascending: false });
    if (isAfiliado && user) query = query.eq("created_by", user.id);
    const { data } = await query;
    const all = (data as any[]) ?? [];
    setItems(all.filter(isTemp));
    setLoading(false);
  };

  const fetchAfiliados = async () => {
    if (isAfiliado) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-team?action=list`,
        { headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
      );
      if (!response.ok) return;
      const data = await response.json();
      const map: Record<string, AfiliadoInfo> = {};
      (data.team || []).forEach((m: any) => {
        if (m.role !== "admin" && (m.permissions?.is_afiliado || m.permissions?.afiliados)) {
          map[m.id] = { user_id: m.id, display_name: m.display_name || m.email, email: m.email };
        }
      });
      setAfiliadosMap(map);
    } catch {}
  };

  useEffect(() => {
    if (permsLoading) return;
    fetchItems();
    fetchAfiliados();
  }, [permsLoading, isAfiliado, user?.id]);

  const handleCreate = async () => {
    if (!user || !form.nome || !form.email) {
      toast.error("Preencha nome e email");
      return;
    }
    const today = todayBR();
    const { error } = await supabase.from("assinantes").insert({
      nome: form.nome,
      email: form.email,
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
    toast.success("Login temporário criado! Expira em 30 minutos.");
    setDialogOpen(false);
    setForm({ nome: "", email: "" });
    fetchItems();
  };

  const handleDelete = async (a: Assinante) => {
    const { error } = await supabase.from("assinantes").delete().eq("id", a.id);
    if (error) { toast.error("Erro ao remover"); return; }
    toast.success("Removido");
    fetchItems();
  };

  const filtered = useMemo(() => items.filter(a =>
    a.nome.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  ), [items, search]);

  const formatDateTime = (d?: string | null) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return "—"; }
  };

  const expirationLabel = (a: Assinante) => {
    if (!a.created_at) return "—";
    const exp = new Date(new Date(a.created_at).getTime() + 30 * 60 * 1000);
    const now = new Date();
    const diff = exp.getTime() - now.getTime();
    if (diff <= 0) return "Expirado";
    const min = Math.floor(diff / 60000);
    return `${min} min restantes`;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" /> Verificação de Login
          </h1>
          <p className="text-xs text-muted-foreground">Acessos temporários de 30 minutos para teste</p>
        </div>

        {!permsLoading && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="h-4 w-4" /> Novo Acesso Temporário (30min)
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Criar Login Temporário</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                  <p>⏱️ Este acesso dura apenas <strong>30 minutos</strong>. Após esse período, o usuário será expirado automaticamente.</p>
                </div>
                <div><Label>Nome</Label><Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome do cliente" /></div>
                <div><Label>E-mail</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@exemplo.com" /></div>
              </div>
              <Button onClick={handleCreate} className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white">
                <Clock className="h-4 w-4 mr-2" /> Criar Acesso de 30 minutos
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome ou email..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-muted-foreground">Criado em</TableHead>
              <TableHead className="text-muted-foreground">Nome</TableHead>
              <TableHead className="text-muted-foreground">E-mail</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Carregando...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum acesso temporário</TableCell></TableRow>
            ) : (
              filtered.map(a => {
                const label = expirationLabel(a);
                const expired = label === "Expirado";
                return (
                  <TableRow key={a.id} className="border-border hover:bg-muted/30">
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/60 bg-primary/70 px-2.5 py-1 text-xs font-medium text-white whitespace-nowrap">
                        <Calendar className="h-3 w-3" />
                        {formatDateTime(a.created_at)}
                      </span>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell><p className="text-xs text-foreground break-all">{a.email}</p></TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${expired ? "border-red-500/30 bg-red-500/10 text-red-400" : "border-orange-500/30 bg-orange-500/10 text-orange-400"}`}>
                        <Clock className="h-3 w-3" />
                        {label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button onClick={() => handleDelete(a)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="Remover">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
