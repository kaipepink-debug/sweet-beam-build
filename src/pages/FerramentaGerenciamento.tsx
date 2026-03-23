import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format, differenceInDays, isPast, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  Plus, Search, Copy, Pencil, Trash2,
  ArrowUpDown, Check, Eye, EyeOff, ArrowLeft, Mail, Link as LinkIcon, Video, CalendarIcon
} from "lucide-react";

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

const toolsConfig: Record<string, { name: string; logo: string; expiracaoDias: number }> = {
  grok: { name: "SuperGrok", logo: grokLogo, expiracaoDias: 3 },
  chatgpt: { name: "ChatGPT", logo: chatgptLogo, expiracaoDias: 30 },
  claude: { name: "Claude", logo: claudeLogo, expiracaoDias: 30 },
  gemini: { name: "Gemini", logo: geminiLogo, expiracaoDias: 30 },
  midjourney: { name: "Midjourney", logo: midjourneyLogo, expiracaoDias: 30 },
  elevenlabs: { name: "ElevenLabs", logo: elevenlabsLogo, expiracaoDias: 30 },
  runwayml: { name: "Runway ML", logo: runwaymlLogo, expiracaoDias: 30 },
  canva: { name: "Canva Pro", logo: canvaLogo, expiracaoDias: 7 },
  innerai: { name: "Inner AI", logo: inneraiLogo, expiracaoDias: 7 },
  tess: { name: "Tess", logo: tessLogo, expiracaoDias: 7 },
  copyai: { name: "Copy.AI", logo: copyaiLogo, expiracaoDias: 30 },
  kling: { name: "Kling", logo: klingLogo, expiracaoDias: 30 },
  synthesia: { name: "Synthesia", logo: synthesiaLogo, expiracaoDias: 30 },
  higgsfield: { name: "Higgsfield Creator", logo: higgsFieldLogo, expiracaoDias: 30 },
  sora: { name: "Sora", logo: soraLogo, expiracaoDias: 30 },
  veo3: { name: "Veo 3", logo: veo3Logo, expiracaoDias: 30 },
  hailuo: { name: "Hailuo", logo: hailuoLogo, expiracaoDias: 30 },
  freepik: { name: "Freepik", logo: freepikLogo, expiracaoDias: 30 },
  heygen: { name: "Heygen", logo: heygenLogo, expiracaoDias: 30 },
};

const farmingVideos: Record<string, string> = {
  grok: "https://www.loom.com/share/84fa11f334e249d0a38a5124aae75775",
  gemini: "https://www.loom.com/share/f7d0654ecf074fa79433f6a5c43a6bb2",
  tess: "https://www.loom.com/share/7d2ce63764b54b26907a47b478662183",
  innerai: "https://www.loom.com/share/74210d8eceb24d8fb800ee9e21bb5213",
  canva: "https://www.loom.com/share/23bd394b17b845aa865d71481f5f55be",
  leonardo: "https://www.loom.com/share/55052e29d8d54db4b6927c7ed9a26392",
  capcut: "https://www.loom.com/share/5eebacc4bc314c688f1b02ff28fa6237",
};

type Acesso = {
  id: string;
  ferramenta: string;
  email_cliente: string;
  login: string;
  senha: string;
  data_criacao: string;
  data_expiracao: string;
  video_url: string | null;
  gmail_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type AcessoForm = {
  email_cliente: string;
  login: string;
  senha: string;
  video_url: string;
};

type Gmail = {
  id: string;
  gmail: string;
};

type AcessoMode = "gmail" | "fornecedor" | null;

const emptyForm: AcessoForm = {
  email_cliente: "",
  login: "",
  senha: "",
  video_url: "",
};

function getStatus(dataExpiracao: string) {
  const exp = new Date(dataExpiracao);
  const now = new Date();
  if (isPast(exp)) return "expirado";
  if (differenceInDays(exp, now) < 1) return "proximo";
  return "ativo";
}

const statusConfig = {
  ativo: { label: "Ativo", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  proximo: { label: "Expirando", color: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  expirado: { label: "Expirado", color: "bg-red-500/15 text-red-400 border-red-500/20" },
};

export default function FerramentaGerenciamento() {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toolConfig = toolId ? toolsConfig[toolId] : null;

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [sortAsc, setSortAsc] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modeSelect, setModeSelect] = useState(false);
  const [acessoMode, setAcessoMode] = useState<AcessoMode>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AcessoForm>(emptyForm);
  const [videoModal, setVideoModal] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [customDateEnabled, setCustomDateEnabled] = useState(false);
  const [customDate, setCustomDate] = useState("");

  const { data: gmailsList = [] } = useQuery({
    queryKey: ["gmails-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gmails")
        .select("id, gmail")
        .order("gmail", { ascending: true });
      if (error) throw error;
      return data as Gmail[];
    },
  });

  const { data: gmailsUtilizados = [] } = useQuery({
    queryKey: ["gmails-utilizados", toolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gmails_utilizados")
        .select("gmail_id, gmail_email")
        .eq("ferramenta", toolId!);
      if (error) throw error;
      return data as { gmail_id: string; gmail_email: string }[];
    },
    enabled: !!toolId,
  });

  const { data: acessos = [], isLoading } = useQuery({
    queryKey: ["acessos", toolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("acessos")
        .select("*")
        .eq("ferramenta", toolId!)
        .order("data_expiracao", { ascending: true });
      if (error) throw error;
      return data as Acesso[];
    },
    enabled: !!toolId,
  });

  const upsertMutation = useMutation({
    mutationFn: async (payload: { id?: string } & AcessoForm) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const dias = toolConfig?.expiracaoDias || 30;
      const baseDate = customDateEnabled && customDate ? new Date(customDate + "T00:00:00") : new Date();
      const expDate = addDays(baseDate, dias);

      // Find the gmail_id from the selected email (only for gmail mode)
      const matchedGmail = gmailsList.find(g => g.gmail === payload.email_cliente.trim());

      if (payload.id) {
        const { error } = await supabase.from("acessos").update({
          ferramenta: toolId!,
          email_cliente: payload.email_cliente.trim(),
          login: payload.login.trim(),
          senha: payload.senha,
          video_url: payload.video_url.trim() || null,
          gmail_id: matchedGmail?.id || null,
          created_by: user.id,
        }).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("acessos").insert({
          ferramenta: toolId!,
          email_cliente: payload.email_cliente.trim(),
          login: payload.login.trim(),
          senha: payload.senha,
          video_url: payload.video_url.trim() || null,
          gmail_id: matchedGmail?.id || null,
          created_by: user.id,
          data_criacao: baseDate.toISOString(),
          data_expiracao: expDate.toISOString(),
        });
        if (error) throw error;

        // Record gmail as used for this tool (so it can't be reused even after deletion)
        if (matchedGmail) {
          await supabase.from("gmails_utilizados").upsert({
            gmail_id: matchedGmail.id,
            gmail_email: matchedGmail.gmail,
            ferramenta: toolId!,
          }, { onConflict: "gmail_id,ferramenta" });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acessos"] });
      queryClient.invalidateQueries({ queryKey: ["acessos-all"] });
      queryClient.invalidateQueries({ queryKey: ["gmails-utilizados"] });
      setDialogOpen(false);
      setEditingId(null);
      setAcessoMode(null);
      setForm(emptyForm);
      setCustomDateEnabled(false);
      setCustomDate("");
      toast.success(editingId ? "Acesso atualizado!" : "Acesso criado!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("acessos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acessos"] });
      queryClient.invalidateQueries({ queryKey: ["acessos-all"] });
      setDeleteConfirm(null);
      toast.success("Acesso removido!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = useMemo(() => {
    let list = acessos;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(a => a.email_cliente.toLowerCase().includes(q) || a.login.toLowerCase().includes(q));
    }
    if (filterStatus !== "todos") {
      list = list.filter(a => getStatus(a.data_expiracao) === filterStatus);
    }
    list = [...list].sort((a, b) => {
      const da = new Date(a.data_expiracao).getTime();
      const db = new Date(b.data_expiracao).getTime();
      return sortAsc ? da - db : db - da;
    });
    return list;
  }, [acessos, search, filterStatus, sortAsc]);

  const counts = useMemo(() => {
    const c = { ativo: 0, proximo: 0, expirado: 0 };
    acessos.forEach(a => { c[getStatus(a.data_expiracao)]++; });
    return c;
  }, [acessos]);

  function openEdit(a: Acesso) {
    setEditingId(a.id);
    setForm({
      email_cliente: a.email_cliente,
      login: a.login,
      senha: a.senha,
      video_url: a.video_url || "",
    });
    // Detect mode: if has gmail_id it's gmail, otherwise fornecedor
    setAcessoMode(a.gmail_id ? "gmail" : "fornecedor");
    setDialogOpen(true);
  }

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setAcessoMode(null);
    setModeSelect(true);
  }

  function selectMode(mode: AcessoMode) {
    setAcessoMode(mode);
    setModeSelect(false);
    setDialogOpen(true);
  }

  async function handleCopy(text: string, fieldId: string) {
    await navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success("Copiado!");
    setTimeout(() => setCopiedField(null), 2000);
  }

  function togglePassword(id: string) {
    setVisiblePasswords(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function getVideoEmbedUrl(url: string) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  }

  if (!toolConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Ferramenta não encontrada.</p>
      </div>
    );
  }

  return (
    <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard-ferramentas")}
                className="rounded-full h-10 w-10 shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center shadow-lg">
                <img src={toolConfig.logo} alt={toolConfig.name} className="w-9 h-9 object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{toolConfig.name}</h1>
                <p className="text-muted-foreground text-sm">Gerenciamento de acessos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {toolId && farmingVideos[toolId] && (
                <Button
                  variant="outline"
                  onClick={() => window.open(farmingVideos[toolId!], "_blank")}
                  className="rounded-2xl gap-2 border-border"
                >
                  <Video className="w-4 h-4" />
                  Farmar ferramenta
                </Button>
              )}
              <Button onClick={openNew} className="rounded-2xl gap-2 shadow-lg">
                <Plus className="w-4 h-4" />
                Adicionar acesso
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {([["ativo", "Ativos"], ["proximo", "Expirando"], ["expirado", "Expirados"]] as const).map(([key, label]) => (
              <div
                key={key}
                onClick={() => setFilterStatus(filterStatus === key ? "todos" : key)}
                className={cn(
                  "rounded-2xl border p-4 cursor-pointer transition-all",
                  filterStatus === key ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:border-border/80"
                )}
              >
                <p className="text-muted-foreground text-xs mb-1">{label}</p>
                <p className={cn("text-2xl font-bold", statusConfig[key].color.split(" ")[1])}>{counts[key]}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por e-mail..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 rounded-2xl bg-card border-border"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setSortAsc(!sortAsc)}
              className="rounded-2xl gap-2 border-border"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortAsc ? "Expira primeiro" : "Expira último"}
            </Button>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="grid gap-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-28 rounded-2xl bg-card border border-border animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg mb-2">Nenhum acesso encontrado</p>
              <p className="text-sm">Clique em "Adicionar acesso" para começar.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filtered.map(a => {
                const status = getStatus(a.data_expiracao);
                const cfg = statusConfig[status];
                const showPass = visiblePasswords.has(a.id);
                const isFornecedor = !a.gmail_id && !!a.video_url;

                return (
                  <div
                    key={a.id}
                    className={cn(
                      "rounded-2xl border border-border p-4 md:p-5 bg-card transition-all hover:border-border/80",
                      status === "proximo" && "border-amber-500/20",
                      status === "expirado" && "border-red-500/15 opacity-75"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Tool Icon */}
                      <img src={toolConfig.logo} alt={toolConfig.name} className="w-10 h-10 rounded-xl shrink-0 mt-1 object-contain" />

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        {/* Top row */}
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <p className="text-xs text-muted-foreground shrink-0">{isFornecedor ? "Login:" : "Principal:"}</p>
                            <p className="text-sm font-semibold text-foreground truncate">{a.email_cliente}</p>
                            <button onClick={() => handleCopy(a.email_cliente, `email-${a.id}`)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                              {copiedField === `email-${a.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <Badge variant="outline" className={cn("rounded-full text-[10px] px-2.5 py-0.5 border", cfg.color)}>
                            {cfg.label}
                          </Badge>
                          {isFornecedor && (
                            <Badge variant="outline" className="rounded-full text-[10px] px-2.5 py-0.5 border border-primary/30 text-primary bg-primary/10">
                              Fornecedor
                            </Badge>
                          )}
                        </div>

                        {/* Senha */}
                        <div className="flex items-center gap-1.5 mb-2">
                          <p className="text-xs text-muted-foreground">Senha:</p>
                          <p className="text-sm font-mono text-foreground">{showPass ? a.senha : "••••••••"}</p>
                          <button onClick={() => togglePassword(a.id)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                            {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => handleCopy(a.senha, `senha-${a.id}`)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                            {copiedField === `senha-${a.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Usuário / Recuperação */}
                        {a.login && (
                          <div className="flex items-center gap-1.5 mb-2">
                            <p className="text-xs text-muted-foreground">{isFornecedor ? "Recuperação:" : "Usuário:"}</p>
                            <p className="text-sm text-foreground truncate">{a.login}</p>
                            <button onClick={() => handleCopy(a.login, `login-${a.id}`)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                              {copiedField === `login-${a.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}

                        {/* Link do Fornecedor */}
                        {isFornecedor && a.video_url && (
                          <div className="flex items-center gap-1.5 mb-2">
                            <p className="text-xs text-muted-foreground">Link:</p>
                            <a href={a.video_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary truncate hover:underline">{a.video_url}</a>
                            <button onClick={() => handleCopy(a.video_url!, `link-${a.id}`)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
                              {copiedField === `link-${a.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}

                        {/* Expiração */}
                        <div className="flex items-center gap-1.5 pt-1 border-t border-border/50">
                          <p className="text-xs text-muted-foreground py-1.5">Expira em:</p>
                          <p className="text-xs text-foreground py-1.5">{format(new Date(a.data_expiracao), "dd/MM/yyyy", { locale: ptBR })}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(a)} className="rounded-full h-8 w-8">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(a.id)} className="rounded-full h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

      {/* Mode Selection Dialog */}
      <Dialog open={modeSelect} onOpenChange={setModeSelect}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Tipo de acesso</DialogTitle>
            <DialogDescription>Como deseja adicionar o login?</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <button
              onClick={() => selectMode("gmail")}
              className="flex items-center gap-3 rounded-xl border border-border p-4 hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
            >
              <Mail className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">A partir de um Gmail</p>
                <p className="text-xs text-muted-foreground">Selecione um Gmail cadastrado</p>
              </div>
            </button>
            <button
              onClick={() => selectMode("fornecedor")}
              className="flex items-center gap-3 rounded-xl border border-border p-4 hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
            >
              <LinkIcon className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Fornecedor</p>
                <p className="text-xs text-muted-foreground">Insira os dados manualmente com link</p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar acesso" : acessoMode === "gmail" ? "Novo acesso via Gmail" : "Novo acesso via Fornecedor"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Atualize os dados do acesso." : `Preencha os dados para criar um novo acesso ${toolConfig.name}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {acessoMode === "gmail" ? (
              <div className="grid gap-2">
                <Label>E-mail principal</Label>
                <Select value={form.email_cliente} onValueChange={v => setForm(f => ({ ...f, email_cliente: v }))}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Selecione um Gmail" />
                  </SelectTrigger>
                  <SelectContent>
                    {gmailsList.map(g => {
                      const isUsed = acessos.some(a => a.email_cliente === g.gmail && a.id !== editingId);
                      return (
                        <SelectItem key={g.id} value={g.gmail} disabled={isUsed}>
                          {g.gmail}{isUsed ? " (já usado nesta ferramenta)" : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label>E-mail / Login</Label>
                  <Input placeholder="email@fornecedor.com" value={form.email_cliente} onChange={e => setForm(f => ({ ...f, email_cliente: e.target.value }))} className="rounded-xl" />
                </div>
                <div className="grid gap-2">
                  <Label>Link do Fornecedor <span className="text-destructive">*</span></Label>
                  <Input placeholder="https://fornecedor.com/login" value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} className="rounded-xl" />
                </div>
                <div className="grid gap-2">
                  <Label>E-mail de recuperação <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                  <Input placeholder="recuperacao@email.com" value={form.login} onChange={e => setForm(f => ({ ...f, login: e.target.value }))} className="rounded-xl" />
                </div>
              </>
            )}
            {acessoMode === "gmail" && (
              <div className="grid gap-2">
                <Label>Usuário (opcional)</Label>
                <Input placeholder="nome de usuário" value={form.login} onChange={e => setForm(f => ({ ...f, login: e.target.value }))} className="rounded-xl" />
              </div>
            )}
            <div className="grid gap-2">
              <Label>Senha</Label>
              <Input placeholder="••••••••" value={form.senha} onChange={e => setForm(f => ({ ...f, senha: e.target.value }))} className="rounded-xl" />
            </div>

            {/* Custom creation date */}
            {!editingId && (
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="custom-date"
                    checked={customDateEnabled}
                    onCheckedChange={(checked) => {
                      setCustomDateEnabled(!!checked);
                      if (!checked) setCustomDate("");
                    }}
                  />
                  <Label htmlFor="custom-date" className="text-sm cursor-pointer">Data de criação personalizada</Label>
                </div>
                {customDateEnabled && (
                  <div className="space-y-2">
                    <Input
                      type="date"
                      value={customDate}
                      onChange={e => setCustomDate(e.target.value)}
                      className="rounded-xl"
                    />
                    {customDate && (
                      <p className="text-xs text-muted-foreground">
                        <CalendarIcon className="w-3 h-3 inline mr-1" />
                        Expira em: <span className="text-foreground font-medium">{format(addDays(new Date(customDate + "T00:00:00"), toolConfig?.expiracaoDias || 30), "dd/MM/yyyy", { locale: ptBR })}</span>
                        {" "}({toolConfig?.expiracaoDias} dias)
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Cancelar</Button>
            <Button
              onClick={() => upsertMutation.mutate({ id: editingId || undefined, ...form })}
              disabled={
                !form.email_cliente || !form.senha || upsertMutation.isPending ||
                (acessoMode === "fornecedor" && !form.video_url.trim())
              }
              className="rounded-xl"
            >
              {upsertMutation.isPending ? "Salvando..." : editingId ? "Salvar" : "Criar acesso"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Modal */}
      <Dialog open={!!videoModal} onOpenChange={() => setVideoModal(null)}>
        <DialogContent className="sm:max-w-2xl rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Vídeo Tutorial</DialogTitle>
            <DialogDescription>Aprenda como usar a ferramenta</DialogDescription>
          </DialogHeader>
          {videoModal && (
            <div className="aspect-video w-full">
              <iframe src={getVideoEmbedUrl(videoModal)} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>Tem certeza que deseja excluir este acesso? Essa ação não pode ser desfeita.</DialogDescription>
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
