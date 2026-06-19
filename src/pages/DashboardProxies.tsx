import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Network, Globe, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type Proxy = {
  id: string;
  label: string | null;
  protocol: string;
  host: string;
  port: number;
  username: string | null;
  password: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

type ProxyForm = {
  label: string;
  protocol: string;
  host: string;
  port: string;
  username: string;
  password: string;
  ativo: boolean;
};

const emptyForm: ProxyForm = {
  label: "",
  protocol: "http",
  host: "",
  port: "",
  username: "",
  password: "",
  ativo: true,
};

export default function DashboardProxies() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProxyForm>(emptyForm);
  const [showPassword, setShowPassword] = useState<Set<string>>(new Set());
  const [testingProxy, setTestingProxy] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, string>>({});

  const { data: proxies = [], isLoading } = useQuery({
    queryKey: ["proxies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proxies")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Proxy[];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (payload: { id?: string } & ProxyForm) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("não autenticado");
      const port = parseInt(payload.port, 10);
      if (!payload.host.trim()) throw new Error("Host obrigatório");
      if (!port || port < 1 || port > 65535) throw new Error("Porta inválida (1-65535)");

      const data = {
        label: payload.label.trim() || null,
        protocol: payload.protocol,
        host: payload.host.trim(),
        port,
        username: payload.username.trim() || null,
        password: payload.password || null,
        ativo: payload.ativo,
        created_by: user.id,
      };

      if (payload.id) {
        const { error } = await supabase.from("proxies").update(data).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("proxies").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proxies"] });
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      toast.success(editingId ? "Proxy atualizado" : "Proxy criado");
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const toggleAtivoMutation = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase.from("proxies").update({ ativo }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proxies"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("proxies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proxies"] });
      toast.success("Proxy removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openEdit(p: Proxy) {
    setEditingId(p.id);
    setForm({
      label: p.label || "",
      protocol: p.protocol,
      host: p.host,
      port: String(p.port),
      username: p.username || "",
      password: p.password || "",
      ativo: p.ativo,
    });
    setDialogOpen(true);
  }

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function togglePasswordVisibility(id: string) {
    setShowPassword(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function testProxy(p: Proxy) {
    setTestingProxy(p.id);
    setTestResults(prev => ({ ...prev, [p.id]: "Testando..." }));
    // Apenas validação de formato. Teste real só pela extensão.
    try {
      const ok = !!(p.host && p.port);
      setTestResults(prev => ({
        ...prev,
        [p.id]: ok
          ? `Formato válido. Pra testar IP real, ative na extensão e use "Verificar IP" no popup.`
          : `Configuração incompleta.`,
      }));
    } catch (e) {
      setTestResults(prev => ({ ...prev, [p.id]: `Erro: ${(e as Error).message}` }));
    } finally {
      setTestingProxy(null);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Network className="h-6 w-6 text-primary" /> Proxies
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Gerencie a pool de proxies que a extensão usa pra rotear tráfego das ferramentas (ChatGPT, Gemini, etc.).
            Quando o cliente abre o painel, a extensão recebe o proxy ativo via sync.
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> Novo proxy
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : proxies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-12 text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Network className="h-6 w-6 text-primary/70" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Nenhum proxy cadastrado</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Adicione o primeiro pra começar a rotear tráfego das ferramentas.
            </p>
          </div>
          <Button onClick={openNew} className="gap-2 mt-2">
            <Plus className="h-4 w-4" /> Cadastrar proxy
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {proxies.map(p => (
            <div
              key={p.id}
              className="rounded-xl border border-border/60 bg-card/80 p-4 flex items-center gap-4 shadow-sm"
            >
              <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Globe className="h-5 w-5 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground">
                    {p.label || `${p.host}:${p.port}`}
                  </span>
                  <Badge variant="outline" className="uppercase text-[10px]">
                    {p.protocol}
                  </Badge>
                  {p.ativo ? (
                    <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/15">ativo</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">desativado</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-mono space-x-3">
                  <span>{p.host}:{p.port}</span>
                  {p.username && (
                    <span>
                      {p.username}:{showPassword.has(p.id) ? p.password : "••••••"}{" "}
                      <button
                        onClick={() => togglePasswordVisibility(p.id)}
                        className="text-primary hover:underline text-[10.5px]"
                      >
                        {showPassword.has(p.id) ? "ocultar" : "mostrar"}
                      </button>
                    </span>
                  )}
                </div>
                <div className="text-[10.5px] text-muted-foreground/70 mt-0.5">
                  criado {formatDistanceToNow(new Date(p.created_at), { addSuffix: true, locale: ptBR })}
                </div>
                {testResults[p.id] && (
                  <div className="text-[11px] text-muted-foreground mt-1.5 italic">
                    {testResults[p.id]}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={p.ativo}
                  onCheckedChange={ativo => toggleAtivoMutation.mutate({ id: p.id, ativo })}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => testProxy(p)}
                  disabled={testingProxy === p.id}
                  className="text-muted-foreground"
                  title="Validar configuração"
                >
                  {testingProxy === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Testar"}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(p)} className="text-muted-foreground">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm(`Remover proxy ${p.label || p.host}?`)) deleteMutation.mutate(p.id);
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar proxy" : "Novo proxy"}</DialogTitle>
            <DialogDescription>
              Configure o proxy que a extensão vai usar pra rotear o tráfego das ferramentas.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <Label>Nome (opcional)</Label>
              <Input
                placeholder="ex: BR-SP-1, Webshare DC"
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              />
            </div>

            <div className="grid gap-1.5">
              <Label>Protocolo</Label>
              <Select value={form.protocol} onValueChange={v => setForm(f => ({ ...f, protocol: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="http">HTTP</SelectItem>
                  <SelectItem value="https">HTTPS</SelectItem>
                  <SelectItem value="socks5">SOCKS5</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-1.5 col-span-2">
                <Label>Host</Label>
                <Input
                  placeholder="proxy.exemplo.com"
                  value={form.host}
                  onChange={e => setForm(f => ({ ...f, host: e.target.value }))}
                  className="font-mono"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Porta</Label>
                <Input
                  type="number"
                  min={1}
                  max={65535}
                  placeholder="8080"
                  value={form.port}
                  onChange={e => setForm(f => ({ ...f, port: e.target.value }))}
                  className="font-mono"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label>Usuário <span className="text-muted-foreground text-xs">(opcional)</span></Label>
              <Input
                placeholder="user"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="font-mono"
                autoComplete="off"
              />
            </div>

            <div className="grid gap-1.5">
              <Label>Senha <span className="text-muted-foreground text-xs">(opcional)</span></Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="font-mono"
                autoComplete="new-password"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Switch
                checked={form.ativo}
                onCheckedChange={ativo => setForm(f => ({ ...f, ativo }))}
              />
              <Label className="!mb-0 cursor-pointer" onClick={() => setForm(f => ({ ...f, ativo: !f.ativo }))}>
                Proxy ativo (extensão vai usar)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => upsertMutation.mutate({ id: editingId || undefined, ...form })}
              disabled={upsertMutation.isPending}
            >
              {upsertMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingId ? "Salvar alterações" : "Criar proxy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
