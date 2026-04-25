import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Clock, Eye, EyeOff, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type AcessoTemp = {
  id: string;
  ferramenta: string;
  login: string;
  senha: string;
  url_acesso: string | null;
  observacoes: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

type FormState = {
  ferramenta: string;
  login: string;
  senha: string;
  url_acesso: string;
  observacoes: string;
  ativo: boolean;
};

const emptyForm: FormState = {
  ferramenta: "",
  login: "",
  senha: "",
  url_acesso: "",
  observacoes: "",
  ativo: true,
};

export default function DashboardFerramentasTemp() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const { data: acessos = [], isLoading } = useQuery({
    queryKey: ["acessos-temporarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("acessos_temporarios")
        .select("*")
        .order("ferramenta", { ascending: true });
      if (error) throw error;
      return data as AcessoTemp[];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const payload = {
        ferramenta: form.ferramenta.trim(),
        login: form.login.trim(),
        senha: form.senha,
        url_acesso: form.url_acesso.trim() || null,
        observacoes: form.observacoes.trim() || null,
        ativo: form.ativo,
      };

      if (!payload.ferramenta || !payload.login || !payload.senha) {
        throw new Error("Preencha ferramenta, login e senha");
      }

      if (editingId) {
        const { error } = await supabase
          .from("acessos_temporarios")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("acessos_temporarios").insert({
          ...payload,
          created_by: user.id,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acessos-temporarios"] });
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      toast.success(editingId ? "Acesso atualizado!" : "Acesso criado!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleAtivoMutation = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase
        .from("acessos_temporarios")
        .update({ ativo })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acessos-temporarios"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("acessos_temporarios").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acessos-temporarios"] });
      setDeleteId(null);
      toast.success("Acesso removido!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(a: AcessoTemp) {
    setEditingId(a.id);
    setForm({
      ferramenta: a.ferramenta,
      login: a.login,
      senha: a.senha,
      url_acesso: a.url_acesso || "",
      observacoes: a.observacoes || "",
      ativo: a.ativo,
    });
    setDialogOpen(true);
  }

  function toggleReveal(id: string) {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Ferramentas — Acesso Temporário</h1>
            <p className="text-sm text-muted-foreground">
              Credenciais exibidas para usuários com plano Temporário (30 min)
            </p>
          </div>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" /> Novo acesso
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : acessos.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card/50 p-10 text-center">
          <Clock className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">
            Nenhuma ferramenta temporária cadastrada. Clique em "Novo acesso" para começar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {acessos.map((a) => {
            const isVisible = revealed.has(a.id);
            return (
              <div
                key={a.id}
                className="rounded-xl border border-border bg-card/50 hover:bg-card transition-colors p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-foreground capitalize">{a.ferramenta}</h3>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          a.ativo
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                            : "bg-red-500/15 text-red-400 border-red-500/25"
                        }`}
                      >
                        {a.ativo ? "Ativo" : "Desativado"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(a)} className="h-8 w-8">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteId(a.id)}
                      className="h-8 w-8 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm">
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Login:</strong> {a.login}
                  </p>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <strong className="text-foreground">Senha:</strong>{" "}
                    <span className="font-mono">{isVisible ? a.senha : "••••••••"}</span>
                    <button
                      onClick={() => toggleReveal(a.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </p>
                  {a.url_acesso && (
                    <a
                      href={a.url_acesso}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Abrir URL <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {a.observacoes && (
                    <p className="text-[11px] text-muted-foreground/80 border-t border-border/40 pt-2">{a.observacoes}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <span className="text-[11px] text-muted-foreground">Visível para clientes</span>
                  <Switch
                    checked={a.ativo}
                    onCheckedChange={(v) => toggleAtivoMutation.mutate({ id: a.id, ativo: v })}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) { setDialogOpen(false); setEditingId(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar acesso" : "Novo acesso temporário"}</DialogTitle>
            <DialogDescription>
              Esses dados são exibidos para usuários com plano temporário (30 min).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="ferramenta">Ferramenta *</Label>
              <Input
                id="ferramenta"
                value={form.ferramenta}
                onChange={(e) => setForm({ ...form, ferramenta: e.target.value })}
                placeholder="Ex: ChatGPT, Midjourney..."
              />
            </div>
            <div>
              <Label htmlFor="login">Login *</Label>
              <Input
                id="login"
                value={form.login}
                onChange={(e) => setForm({ ...form, login: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="senha">Senha *</Label>
              <Input
                id="senha"
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div>
              <Label htmlFor="url">URL de acesso (opcional)</Label>
              <Input
                id="url"
                value={form.url_acesso}
                onChange={(e) => setForm({ ...form, url_acesso: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="obs">Observações (opcional)</Label>
              <Textarea
                id="obs"
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                placeholder="Ex: Use apenas no navegador X"
                rows={2}
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <Label htmlFor="ativo">Visível para clientes</Label>
              <Switch
                id="ativo"
                checked={form.ativo}
                onCheckedChange={(v) => setForm({ ...form, ativo: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => upsertMutation.mutate()} disabled={upsertMutation.isPending}>
              {upsertMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover acesso?</DialogTitle>
            <DialogDescription>Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Removendo..." : "Remover"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
