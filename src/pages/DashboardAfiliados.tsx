import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Handshake, Plus, Trash2, UserCheck, X, Pencil, Check } from "lucide-react";
import { z } from "zod";

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
  max_assinaturas: 10,
};

export default function DashboardAfiliados() {
  const [afiliados, setAfiliados] = useState<AfiliadoMember[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [maxAssinaturas, setMaxAssinaturas] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(10);
  const { toast } = useToast();

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

      // Buscar contagem de assinantes por afiliado
      const ids = onlyAfiliados.map((m: AfiliadoMember) => m.id);
      if (ids.length > 0) {
        const { data: assinantes } = await supabase
          .from("assinantes")
          .select("created_by")
          .in("created_by", ids);
        const map: Record<string, number> = {};
        (assinantes || []).forEach((a: any) => {
          if (a.created_by) map[a.created_by] = (map[a.created_by] || 0) + 1;
        });
        setCounts(map);
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
          permissions: { ...AFILIADO_PERMISSIONS, max_assinaturas: maxAssinaturas },
        }),
      }
    );

    const data = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      toast({ title: "Erro", description: data.error, variant: "destructive" });
      return;
    }

    toast({ title: "Afiliado adicionado!", className: "bg-green-600 text-white border-green-600" });
    setEmail("");
    setPassword("");
    setDisplayName("");
    setMaxAssinaturas(10);
    setShowForm(false);
    fetchAfiliados();
  };

  const handleSaveLimit = async (userId: string) => {
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
        body: JSON.stringify({ user_id: userId, permissions: { max_assinaturas: editValue } }),
      }
    );
    if (response.ok) {
      toast({ title: "Limite atualizado", className: "bg-green-600 text-white border-green-600" });
      setEditingId(null);
      fetchAfiliados();
    } else {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
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

      <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
        Afiliados têm acesso apenas à aba <strong className="text-foreground">Assinaturas</strong>. Defina abaixo quantos assinantes cada afiliado pode cadastrar no painel dele.
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
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm bg-muted border border-border text-foreground outline-none focus:border-primary transition-colors"
                placeholder="Nome do afiliado"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm bg-muted border border-border text-foreground outline-none focus:border-primary transition-colors"
                placeholder="afiliado@exemplo.com"
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
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Limite de assinaturas</label>
              <input
                type="number"
                min={0}
                value={maxAssinaturas}
                onChange={(e) => setMaxAssinaturas(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl text-sm bg-muted border border-border text-foreground outline-none focus:border-primary transition-colors"
                placeholder="10"
              />
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={submitting}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? "Criando..." : "Adicionar Afiliado"}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : afiliados.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <Handshake className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum afiliado cadastrado</p>
          </div>
        ) : (
          afiliados.map((member) => {
            const limit = member.permissions?.max_assinaturas ?? 10;
            const used = counts[member.id] || 0;
            const isEditing = editingId === member.id;
            return (
              <div key={member.id} className="rounded-2xl border border-border bg-card p-5 purple-hover-glow">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Handshake className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{member.display_name || member.email}</p>
                      <p className="text-[10px] text-muted-foreground">{member.email}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Afiliado</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Assinaturas</span>
                      <span className="text-sm font-semibold text-foreground">{used}</span>
                      <span className="text-xs text-muted-foreground">/</span>
                      {isEditing ? (
                        <>
                          <input
                            type="number"
                            min={0}
                            value={editValue}
                            onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 rounded-lg text-sm bg-background border border-border text-foreground outline-none focus:border-primary"
                          />
                          <button
                            onClick={() => handleSaveLimit(member.id)}
                            className="text-emerald-500 hover:text-emerald-400 p-1"
                            title="Salvar"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-muted-foreground hover:text-foreground p-1"
                            title="Cancelar"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-sm font-semibold text-primary">{limit}</span>
                          <button
                            onClick={() => { setEditingId(member.id); setEditValue(limit); }}
                            className="text-muted-foreground hover:text-primary p-1 ml-1"
                            title="Editar limite"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
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
    </div>
  );
}
