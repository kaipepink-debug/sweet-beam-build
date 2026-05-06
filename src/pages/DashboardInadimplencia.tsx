import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Search, Calendar, Mail } from "lucide-react";
import { isTemporarySubscription } from "@/lib/isTemporarySub";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";

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
  created_by?: string | null;
}

interface AfiliadoInfo { user_id: string; display_name: string; email: string; }

export default function DashboardInadimplencia() {
  const { user } = useAuth();
  const { permissions, loading: permsLoading } = usePermissions();
  const isAfiliado = permissions.is_afiliado;
  const [items, setItems] = useState<Assinante[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [afiliadosMap, setAfiliadosMap] = useState<Record<string, AfiliadoInfo>>({});

  const fetchAfiliados = async (): Promise<Record<string, AfiliadoInfo>> => {
    if (isAfiliado) return {};
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return {};
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-team?action=list`,
        { headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
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
    const todayStr = new Date().toISOString().slice(0, 10);
    let query = supabase.from("assinantes").select("*").lt("proxima_cobranca", todayStr).order("proxima_cobranca", { ascending: false });
    if (isAfiliado && user) {
      query = query.eq("created_by", user.id);
    }
    const [{ data }, map] = await Promise.all([query, fetchAfiliados()]);
    const all = (data as any[]) ?? [];
    const filtered = all.filter(a =>
      !isTemporarySubscription(a) &&
      (a.status || "").toLowerCase() !== "cancelada" &&
      a.proxima_cobranca
    );
    setAfiliadosMap(map);
    setItems(filtered);
    setLoading(false);
  };

  useEffect(() => { if (!permsLoading) fetchAll(); }, [permsLoading, isAfiliado, user?.id]);

  const filtered = useMemo(() => items.filter(a =>
    a.nome.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  ), [items, search]);

  const formatDate = (d?: string | null) => {
    if (!d) return "—";
    try {
      const [y, m, day] = d.split("-");
      return `${day}/${m}/${y}`;
    } catch { return "—"; }
  };

  const daysOverdue = (d?: string | null) => {
    if (!d) return 0;
    const exp = new Date(d + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.floor((today.getTime() - exp.getTime()) / 86400000);
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const totalLost = filtered.reduce((s, a) => s + (Number(a.valor) || 0), 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-red-500" /> Inadimplência
        </h1>
        <p className="text-xs text-muted-foreground">Clientes com cobrança vencida</p>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-xl">
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4">
          <p className="text-[10px] uppercase tracking-wider text-red-300/80">Total inadimplente</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{filtered.length}</p>
        </div>
        <div className="rounded-2xl border border-orange-500/40 bg-orange-500/10 p-4">
          <p className="text-[10px] uppercase tracking-wider text-orange-300/80">Valor em aberto</p>
          <p className="text-2xl font-bold text-orange-400 mt-1">{formatCurrency(totalLost)}</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome ou email..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-muted-foreground">Cliente</TableHead>
              <TableHead className="text-muted-foreground">E-mail</TableHead>
              <TableHead className="text-muted-foreground">Produto</TableHead>
              <TableHead className="text-muted-foreground">Valor</TableHead>
              <TableHead className="text-muted-foreground">Vencimento</TableHead>
              <TableHead className="text-muted-foreground">Atraso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Carregando...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum cliente inadimplente</TableCell></TableRow>
            ) : (
              filtered.map(a => {
                const days = daysOverdue(a.proxima_cobranca);
                return (
                  <TableRow key={a.id} className="border-border hover:bg-muted/30">
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
                          por {afiliadosMap[a.created_by].display_name}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-xs text-foreground break-all">
                        <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                        {a.email}
                      </span>
                    </TableCell>
                    <TableCell><p className="text-sm font-semibold text-foreground">{a.produto}</p></TableCell>
                    <TableCell><p className="text-sm font-semibold text-foreground">{formatCurrency(a.valor)}</p></TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/60 bg-red-500/80 px-2.5 py-1 text-xs font-medium text-white">
                        <Calendar className="h-3 w-3" />
                        {formatDate(a.proxima_cobranca)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full border border-red-500/60 bg-red-500/80 px-2.5 py-1 text-xs font-medium text-white">
                        {days} {days === 1 ? "dia" : "dias"}
                      </span>
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
