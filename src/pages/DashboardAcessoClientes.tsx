import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { KeyRound, User, Lock, Save, Loader2, Eye, EyeOff } from "lucide-react";

export default function DashboardAcessoClientes() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [showTotp, setShowTotp] = useState(false);
  const [configId, setConfigId] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("configuracoes_acesso")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      toast({ title: "Erro ao carregar configurações", description: error.message, variant: "destructive" });
    } else if (data) {
      setLogin(data.login);
      setSenha(data.senha);
      setTotpSecret(data.totp_secret);
      setConfigId(data.id);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!login.trim() || !senha.trim() || !totpSecret.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("configuracoes_acesso")
      .update({
        login: login.trim(),
        senha: senha.trim(),
        totp_secret: totpSecret.trim(),
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", configId!);

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Acesso dos clientes atualizado com sucesso!" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Acesso — Clientes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie as credenciais e o código 2FA exibidos no painel dos clientes.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Credenciais de Login
        </h2>

        {/* Login */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Usuário</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Ex: rataria.io"
            />
          </div>
        </div>

        {/* Senha */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type={showSenha ? "text" : "password"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Ex: 2026@Rataria.io"
            />
            <button
              type="button"
              onClick={() => setShowSenha(!showSenha)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-primary" />
          Código de 2 Fatores (TOTP)
        </h2>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Secret TOTP (Base32)</label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type={showTotp ? "text" : "password"}
              value={totpSecret}
              onChange={(e) => setTotpSecret(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Ex: UGOXHQROOAWTC6EPG4FT7WHN..."
            />
            <button
              type="button"
              onClick={() => setShowTotp(!showTotp)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showTotp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Este código será usado para gerar os tokens de autenticação no painel dos clientes.
          </p>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Salvando..." : "Salvar alterações"}
      </button>
    </div>
  );
}
