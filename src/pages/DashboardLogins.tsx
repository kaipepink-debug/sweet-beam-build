import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LogIn, Search } from "lucide-react";

interface LoginRow {
  id: string;
  email: string;
  nome: string | null;
  plano: string | null;
  status: string | null;
  source: string | null;
  login_at: string;
}

export default function DashboardLogins() {
  const [rows, setRows] = useState<LoginRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("client_logins")
        .select("*")
        .order("login_at", { ascending: false })
        .limit(500);
      setRows((data as any) || []);
      setLoading(false);
    })();
  }, []);

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.email?.toLowerCase().includes(q) ||
      r.nome?.toLowerCase().includes(q) ||
      r.plano?.toLowerCase().includes(q)
    );
  });

  const todayBR = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" }).format(new Date());
  const todayCount = rows.filter((r) => {
    const d = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" }).format(new Date(r.login_at));
    return d === todayBR;
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LogIn className="h-6 w-6 text-primary" /> Logins Painel
        </h1>
        <p className="text-sm text-muted-foreground">
          Histórico de acessos de clientes ao painel /usuario.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Logins hoje</p>
          <p className="text-2xl font-bold text-primary">{todayCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total registrado</p>
          <p className="text-2xl font-bold">{rows.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Clientes únicos</p>
          <p className="text-2xl font-bold">
            {new Set(rows.map((r) => r.email)).size}
          </p>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por email, nome ou plano..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">Data / Hora</th>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Plano</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">Carregando...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">Nenhum login registrado ainda.</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border/40 hover:bg-muted/20">
                  <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                    {new Date(r.login_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                  </td>
                  <td className="px-4 py-2.5">{r.nome || "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.email}</td>
                  <td className="px-4 py-2.5">{r.plano || "—"}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-primary/15 text-primary">
                      {r.status || "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
