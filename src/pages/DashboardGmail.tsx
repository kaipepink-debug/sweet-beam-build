import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Copy, Check, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

import googleIcon from "@/assets/google-icon.png";
import chatgptLogo from "@/assets/tools/chatgpt.png";
import midjourneyLogo from "@/assets/tools/midjourney.png";
import elevenlabsLogo from "@/assets/tools/elevenlabs.png";
import canvaLogo from "@/assets/tools/canva.png";
import copyaiLogo from "@/assets/tools/copyai.png";
import runwaymlLogo from "@/assets/tools/runwayml.png";
import klingLogo from "@/assets/tools/kling.png";
import synthesiaLogo from "@/assets/tools/synthesia.png";
import higgsFieldLogo from "@/assets/tools/higgsfield.png";
import soraLogo from "@/assets/tools/sora.png";
import veo3Logo from "@/assets/tools/veo3.png";
import hailuoLogo from "@/assets/tools/hailuo.png";
import grokLogo from "@/assets/tools/grok.png";
import claudeLogo from "@/assets/tools/claude.png";
import freepikLogo from "@/assets/tools/freepik.png";
import heygenLogo from "@/assets/tools/heygen.png";
import inneraiLogo from "@/assets/tools/innerai.png";
import tessLogo from "@/assets/tools/tess.png";
import geminiLogo from "@/assets/tools/gemini.png";

const toolsConfig: Record<string, { name: string; logo: string }> = {
  grok: { name: "SuperGrok", logo: grokLogo },
  chatgpt: { name: "ChatGPT", logo: chatgptLogo },
  claude: { name: "Claude", logo: claudeLogo },
  gemini: { name: "Gemini", logo: geminiLogo },
  midjourney: { name: "Midjourney", logo: midjourneyLogo },
  elevenlabs: { name: "ElevenLabs", logo: elevenlabsLogo },
  runwayml: { name: "Runway ML", logo: runwaymlLogo },
  canva: { name: "Canva Pro", logo: canvaLogo },
  innerai: { name: "Inner AI", logo: inneraiLogo },
  tess: { name: "Tess", logo: tessLogo },
  copyai: { name: "Copy.AI", logo: copyaiLogo },
  kling: { name: "Kling", logo: klingLogo },
  synthesia: { name: "Synthesia", logo: synthesiaLogo },
  higgsfield: { name: "Higgsfield Creator", logo: higgsFieldLogo },
  sora: { name: "Sora", logo: soraLogo },
  veo3: { name: "Veo 3", logo: veo3Logo },
  hailuo: { name: "Hailuo", logo: hailuoLogo },
  freepik: { name: "Freepik", logo: freepikLogo },
  heygen: { name: "Heygen", logo: heygenLogo },
};

type Gmail = {
  id: string;
  gmail: string;
  senha: string;
  email_recuperacao: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type GmailForm = {
  gmail: string;
  senha: string;
  email_recuperacao: string;
};

const emptyForm: GmailForm = { gmail: "", senha: "", email_recuperacao: "" };

export default function DashboardGmail() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GmailForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { data: gmails = [], isLoading } = useQuery({
    queryKey: ["gmails"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gmails")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Gmail[];
    },
  });

  // Fetch all acessos to know which tools use each gmail
  const { data: acessos = [] } = useQuery({
    queryKey: ["acessos-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("acessos")
        .select("id, ferramenta, gmail_id");
      if (error) throw error;
      return data as { id: string; ferramenta: string; gmail_id: string | null }[];
    },
  });

  const gmailToolsMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    acessos.forEach(a => {
      if (a.gmail_id) {
        if (!map[a.gmail_id]) map[a.gmail_id] = [];
        const tool = a.ferramenta;
        if (!map[a.gmail_id].includes(tool)) {
          map[a.gmail_id].push(tool);
        }
      }
    });
    return map;
  }, [acessos]);

  const upsertMutation = useMutation({
    mutationFn: async (payload: { id?: string } & GmailForm) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const record = {
        gmail: payload.gmail.trim(),
        senha: payload.senha,
        email_recuperacao: payload.email_recuperacao.trim() || null,
        created_by: user.id,
      };

      if (payload.id) {
        const { error } = await supabase.from("gmails").update(record).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("gmails").insert(record);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gmails"] });
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      toast.success(editingId ? "Gmail atualizado!" : "Gmail cadastrado!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gmails").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gmails"] });
      queryClient.invalidateQueries({ queryKey: ["acessos"] });
      setDeleteConfirm(null);
      toast.success("Gmail removido!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = useMemo(() => {
    if (!search) return gmails;
    const q = search.toLowerCase();
    return gmails.filter(g =>
      g.gmail.toLowerCase().includes(q) ||
      (g.email_recuperacao && g.email_recuperacao.toLowerCase().includes(q))
    );
  }, [gmails, search]);

  function openEdit(g: Gmail) {
    setEditingId(g.id);
    setForm({ gmail: g.gmail, senha: g.senha, email_recuperacao: g.email_recuperacao || "" });
    setDialogOpen(true);
  }

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  async function handleCopy(text: string, fieldId: string) {
    await navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success("Copiado!");
    setTimeout(() => setCopiedField(null), 2000);
  }


  return (
    <div className="min-h-screen flex w-full bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0 ml-[60px]">
        <DashboardTopbar />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center shadow-lg">
                <Mail className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gmail</h1>
                <p className="text-muted-foreground text-sm">Gerenciamento de contas Gmail</p>
              </div>
            </div>
            <Button onClick={openNew} className="rounded-2xl gap-2 shadow-lg">
              <Plus className="w-4 h-4" />
              Adicionar Gmail
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-muted-foreground text-xs mb-1">Total de Gmails</p>
              <p className="text-2xl font-bold text-foreground">{gmails.length}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-muted-foreground text-xs mb-1">Vinculados a ferramentas</p>
              <p className="text-2xl font-bold text-primary">
                {gmails.filter(g => gmailToolsMap[g.id]?.length > 0).length}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por Gmail ou e-mail de recuperação..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 rounded-2xl bg-card border-border"
            />
          </div>

          {/* List */}
          {isLoading ? (
            <div className="grid gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-28 rounded-2xl bg-card border border-border animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg mb-2">Nenhum Gmail cadastrado</p>
              <p className="text-sm">Clique em "Adicionar Gmail" para começar.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filtered.map(g => {
                const linkedTools = gmailToolsMap[g.id] || [];

                return (
                  <div key={g.id} className="rounded-2xl border border-border p-4 md:p-5 bg-card transition-all hover:border-border/80">
                    <div className="flex items-start gap-4">
                      {/* Google Icon */}
                      <img src={googleIcon} alt="Google" className="w-10 h-10 rounded-xl shrink-0 mt-1" />

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        {/* Top row: Principal | Recuperação */}
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          {/* Gmail principal */}
                          <div className="flex items-center gap-1.5 min-w-0">
                            <p className="text-xs text-muted-foreground shrink-0">Principal:</p>
                            <p className="text-sm font-semibold text-foreground truncate">{g.gmail}</p>
                            <button onClick={() => handleCopy(g.gmail, `gmail-${g.id}`)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                              {copiedField === `gmail-${g.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          <span className="text-border">|</span>

                          {/* Recovery email */}
                          <div className="flex items-center gap-1.5 min-w-0">
                            <p className="text-xs text-muted-foreground shrink-0">Recuperação:</p>
                            <p className="text-sm text-foreground truncate">{g.email_recuperacao || "—"}</p>
                            {g.email_recuperacao && (
                              <button onClick={() => handleCopy(g.email_recuperacao!, `rec-${g.id}`)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                                {copiedField === `rec-${g.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Senha */}
                        <div className="flex items-center gap-1.5 mb-3">
                          <p className="text-xs text-muted-foreground">Senha:</p>
                          <p className="text-sm font-mono text-foreground">{g.senha}</p>
                          <button onClick={() => handleCopy(g.senha, `senha-${g.id}`)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                            {copiedField === `senha-${g.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Ferramentas vinculadas */}
                        <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                          <p className="text-xs text-muted-foreground shrink-0 py-1.5">Ferramentas:</p>
                          {linkedTools.length > 0 ? (
                            <div className="flex items-center gap-1.5 flex-wrap py-1.5">
                              {linkedTools.map(toolKey => {
                                const tool = toolsConfig[toolKey];
                                return tool ? (
                                  <img key={toolKey} src={tool.logo} alt={tool.name} title={tool.name} className="w-6 h-6 rounded-md object-contain" />
                                ) : null;
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground/60 py-1.5">Nenhuma ferramenta vinculada</p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(g)} className="rounded-full h-8 w-8">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(g.id)} className="rounded-full h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Gmail" : "Novo Gmail"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Atualize os dados do Gmail." : "Preencha os dados para cadastrar um novo Gmail."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Gmail</Label>
              <Input placeholder="exemplo@gmail.com" value={form.gmail} onChange={e => setForm(f => ({ ...f, gmail: e.target.value }))} className="rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label>Senha</Label>
              <Input placeholder="••••••••" value={form.senha} onChange={e => setForm(f => ({ ...f, senha: e.target.value }))} className="rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label>E-mail de recuperação (opcional)</Label>
              <Input placeholder="recuperacao@email.com" value={form.email_recuperacao} onChange={e => setForm(f => ({ ...f, email_recuperacao: e.target.value }))} className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Cancelar</Button>
            <Button
              onClick={() => upsertMutation.mutate({ id: editingId || undefined, ...form })}
              disabled={!form.gmail || !form.senha || upsertMutation.isPending}
              className="rounded-xl"
            >
              {upsertMutation.isPending ? "Salvando..." : editingId ? "Salvar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>Tem certeza que deseja excluir este Gmail? As ferramentas vinculadas perderão a associação.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="rounded-xl">Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)} disabled={deleteMutation.isPending} className="rounded-xl">
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
