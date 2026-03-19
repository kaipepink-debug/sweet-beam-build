import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, differenceInDays, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  Plus, Search, Copy, Pencil, Trash2, Play, CalendarIcon,
  ArrowUpDown, Check, Eye, EyeOff, ArrowLeft
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

const toolsConfig: Record<string, { name: string; logo: string; expiracaoDias: number }> = {
  grok: { name: "SuperGrok", logo: grokLogo, expiracaoDias: 3 },
  chatgpt: { name: "ChatGPT", logo: chatgptLogo, expiracaoDias: 30 },
  claude: { name: "Claude", logo: claudeLogo, expiracaoDias: 30 },
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
  data_criacao: Date;
  data_expiracao: Date;
  video_url: string;
  gmail_id: string;
};

type Gmail = {
  id: string;
  gmail: string;
};

const emptyForm: AcessoForm = {
  email_cliente: "",
  login: "",
  senha: "",
  data_criacao: new Date(),
  data_expiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  video_url: "",
  gmail_id: "",
};

function getStatus(dataExpiracao: string) {
  const exp = new Date(dataExpiracao);
  if (isPast(exp)) return "expirado";
  if (differenceInDays(exp, new Date()) < 3) return "proximo";
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AcessoForm>(emptyForm);
  const [videoModal, setVideoModal] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

      const record = {
        ferramenta: toolId!,
        email_cliente: payload.email_cliente.trim(),
        login: payload.login.trim(),
        senha: payload.senha,
        data_criacao: payload.data_criacao.toISOString(),
        data_expiracao: payload.data_expiracao.toISOString(),
        video_url: payload.video_url || null,
        gmail_id: payload.gmail_id || null,
        created_by: user.id,
      };

      if (payload.id) {
        const { error } = await supabase.from("acessos").update(record).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("acessos").insert(record);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acessos"] });
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
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
      data_criacao: new Date(a.data_criacao),
      data_expiracao: new Date(a.data_expiracao),
      video_url: a.video_url || "",
      gmail_id: a.gmail_id || "",
    });
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
    <div className="min-h-screen flex w-full bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0 ml-[60px]">
        <DashboardTopbar />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
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
            <Button onClick={openNew} className="rounded-2xl gap-2 shadow-lg">
              <Plus className="w-4 h-4" />
              Adicionar acesso
            </Button>
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

                return (
                  <div
                    key={a.id}
                    className={cn(
                      "rounded-2xl border p-4 md:p-5 bg-card transition-all hover:border-border/80",
                      status === "proximo" && "border-amber-500/20",
                      status === "expirado" && "border-red-500/15 opacity-75"
                    )}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <p className="text-[11px] text-muted-foreground mb-0.5">E-mail principal</p>
                          <p className="text-sm font-medium text-foreground truncate">{a.email_cliente}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground mb-0.5">Usuário</p>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-foreground truncate">{a.login}</p>
                            <button
                              onClick={() => handleCopy(a.login, `login-${a.id}`)}
                              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                            >
                              {copiedField === `login-${a.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground mb-0.5">Senha</p>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-foreground font-mono">
                              {showPass ? a.senha : "••••••••"}
                            </p>
                            <button
                              onClick={() => togglePassword(a.id)}
                              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                            >
                              {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleCopy(a.senha, `senha-${a.id}`)}
                              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                            >
                              {copiedField === `senha-${a.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground mb-0.5">Expira em</p>
                          <p className="text-sm font-medium text-foreground">
                            {format(new Date(a.data_expiracao), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={cn("rounded-full text-[10px] px-2.5 py-0.5 border", cfg.color)}>
                          {cfg.label}
                        </Badge>
                        {a.video_url && (
                          <Button variant="ghost" size="icon" onClick={() => setVideoModal(a.video_url!)} className="rounded-full h-8 w-8">
                            <Play className="w-3.5 h-3.5" />
                          </Button>
                        )}
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
        </main>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar acesso" : "Novo acesso"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Atualize os dados do acesso." : `Preencha os dados para criar um novo acesso ${toolConfig.name}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
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
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Usuário (opcional)</Label>
                <Input placeholder="nome de usuário" value={form.login} onChange={e => setForm(f => ({ ...f, login: e.target.value }))} className="rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label>Senha</Label>
                <Input placeholder="••••••••" value={form.senha} onChange={e => setForm(f => ({ ...f, senha: e.target.value }))} className="rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Data de criação</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("justify-start text-left font-normal rounded-xl", !form.data_criacao && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(form.data_criacao, "dd/MM/yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={form.data_criacao} onSelect={d => d && setForm(f => ({ ...f, data_criacao: d }))} className="p-3 pointer-events-auto" locale={ptBR} />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label>Data de expiração</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("justify-start text-left font-normal rounded-xl", !form.data_expiracao && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(form.data_expiracao, "dd/MM/yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={form.data_expiracao} onSelect={d => d && setForm(f => ({ ...f, data_expiracao: d }))} className="p-3 pointer-events-auto" locale={ptBR} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Cancelar</Button>
            <Button
              onClick={() => upsertMutation.mutate({ id: editingId || undefined, ...form })}
              disabled={!form.email_cliente || !form.senha || upsertMutation.isPending}
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
