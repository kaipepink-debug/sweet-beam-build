import { useState, useEffect, useCallback } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users2, Plus, Trash2, Shield, UserCheck, X, Pencil } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";

const createMemberSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(8, "Mínimo 8 caracteres").max(72),
  displayName: z.string().trim().min(1, "Nome é obrigatório").max(100),
});

interface TeamMember {
  id: string;
  email: string;
  display_name: string;
  role: string;
  permissions: Record<string, boolean> | null;
  created_at: string;
}

const PERMISSION_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  financeiro: "Financeiro",
  vendas: "Vendas",
  assinaturas: "Assinaturas",
  clientes: "Clientes",
  email_acesso: "E-mail - Acesso",
  ferramentas_ia: "Ferramentas IA",
  analytics: "Analytics",
  equipe: "Equipe",
  configuracoes: "Configurações",
};

export default function DashboardEquipe() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [newPermissions, setNewPermissions] = useState<Record<string, boolean>>({
    dashboard: false,
    financeiro: false,
    vendas: false,
    assinaturas: false,
    clientes: false,
    email_acesso: true,
    ferramentas_ia: true,
    analytics: false,
    configuracoes: false,
    equipe: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTeam = useCallback(async () => {
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
      setTeam(data.team || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const handleCreate = async () => {
    const result = createMemberSchema.safeParse({ email, password, displayName });
    if (!result.success) {
      toast({ title: "Erro", description: result.error.errors[0].message, variant: "destructive" });
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
          permissions: newPermissions,
        }),
      }
    );

    const data = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      toast({ title: "Erro", description: data.error, variant: "destructive" });
      return;
    }

    toast({ title: "Membro adicionado!" });
    setEmail("");
    setPassword("");
    setDisplayName("");
    setShowForm(false);
    fetchTeam();
  };

  const handleUpdatePermission = async (userId: string, key: string, value: boolean) => {
    const { data: { session } } = await supabase.auth.getSession();

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-team?action=update-permissions`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session!.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId, permissions: { [key]: value } }),
      }
    );

    if (response.ok) {
      setTeam((prev) =>
        prev.map((m) =>
          m.id === userId
            ? { ...m, permissions: { ...m.permissions, [key]: value } }
            : m
        )
      );
      toast({ title: "Permissão atualizada" });
    }
  };

  const handleRemove = async (userId: string) => {
    const { data: { session } } = await supabase.auth.getSession();

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-team?action=remove`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session!.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId }),
      }
    );

    if (response.ok) {
      toast({ title: "Membro removido" });
      fetchTeam();
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0 ml-[220px]">
        <DashboardTopbar />
        <main className="flex-1 p-4 md:p-6 space-y-5 overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Gerencie os membros da sua equipe</p>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Equipe</h1>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showForm ? "Cancelar" : "Novo Membro"}
            </button>
          </div>

          {/* Add Member Form */}
          {showForm && (
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                Adicionar Membro
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Nome</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm bg-muted border border-border text-foreground outline-none focus:border-primary transition-colors"
                    placeholder="Nome do membro"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm bg-muted border border-border text-foreground outline-none focus:border-primary transition-colors"
                    placeholder="membro@equipe.com"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm bg-muted border border-border text-foreground outline-none focus:border-primary transition-colors"
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
              </div>

              {/* Permissions toggles */}
              <div>
                <label className="block text-xs text-muted-foreground mb-3">Permissões</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5 bg-muted/30"
                    >
                      <span className="text-xs font-medium text-foreground">{label}</span>
                      <Switch
                        checked={newPermissions[key]}
                        onCheckedChange={(v) => setNewPermissions((p) => ({ ...p, [key]: v }))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={submitting}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? "Criando..." : "Adicionar Membro"}
              </button>
            </div>
          )}

          {/* Team List */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : team.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center">
                <Users2 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Nenhum membro na equipe</p>
              </div>
            ) : (
              [...team].sort((a, b) => {
                const aM = a.email === "mandarrari@rataria.io" ? 0 : 1;
                const bM = b.email === "mandarrari@rataria.io" ? 0 : 1;
                return aM - bM;
              }).map((member) => (
                <div
                  key={member.id}
                  className="rounded-2xl border border-border bg-card p-5 purple-hover-glow"
                >
                  {(() => {
                    const isMaster = member.email === "mandarrari@rataria.io";
                    const memberName = isMaster ? "Mandarrari" : member.display_name || member.email;
                    return (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                              {isMaster || member.role === "admin" ? (
                                <Shield className="h-4 w-4 text-primary" />
                              ) : (
                                <Users2 className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{memberName}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {member.email}
                              </p>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                {isMaster ? "Master" : member.role === "admin" ? "Administrador" : "Membro"}
                              </p>
                            </div>
                          </div>
                          {!isMaster && member.role !== "admin" && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditingMemberId(editingMemberId === member.id ? null : member.id)}
                                className="text-muted-foreground hover:text-primary transition-colors p-2"
                                title="Editar permissões"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRemove(member.id)}
                                className="text-destructive/60 hover:text-destructive transition-colors p-2"
                                title="Remover membro"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Compact: show only active permissions as badges */}
                        {!isMaster && editingMemberId !== member.id && (
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(PERMISSION_LABELS)
                              .filter(([key]) => member.permissions?.[key])
                              .map(([, label]) => (
                                <span
                                  key={label}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-500/15 text-green-400"
                                >
                                  {label}
                                </span>
                              ))}
                            {Object.entries(PERMISSION_LABELS).filter(([key]) => member.permissions?.[key]).length === 0 && (
                              <span className="text-[10px] text-muted-foreground">Nenhuma permissão</span>
                            )}
                          </div>
                        )}

                        {/* Expanded: permission toggles */}
                        {!isMaster && editingMemberId === member.id && (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                              <div
                                key={key}
                                className="flex items-center justify-between rounded-lg border border-border/50 px-2.5 py-2 bg-muted/20"
                              >
                                <span className="text-[11px] text-muted-foreground">{label}</span>
                                <Switch
                                  checked={member.permissions?.[key] ?? false}
                                  onCheckedChange={(v) => handleUpdatePermission(member.id, key, v)}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
