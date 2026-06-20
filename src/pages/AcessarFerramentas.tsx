import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Download, AlertTriangle, Sparkles, ExternalLink, Loader2, CheckCircle2, KeyRound, RefreshCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getSubscriptionFromStorage, getActiveSubscription, isTemporarySubscription } from "@/lib/isTemporarySub";
import NeuralBackground from "@/components/sales/NeuralBackground";

import chatgptLogo from "@/assets/tools/chatgpt.png";
import geminiLogo from "@/assets/tools/gemini.png";

const MVP_TOOLS = [
  { key: "chatgpt", name: "ChatGPT", logo: chatgptLogo, accent: "139, 92, 246", loginUrl: "https://chatgpt.com/auth/login" },
  { key: "gemini", name: "Gemini", logo: geminiLogo, accent: "59, 130, 246", loginUrl: null /* abre via background com logout */ },
];

type Acesso = {
  id: string;
  ferramenta: string;
  login: string;
  senha: string;
  email_cliente: string | null;
  data_expiracao: string;
  totp_secret?: string | null;
};

type ExtensionStatus = {
  ok: boolean;
  version?: string;
  syncedAt?: number | null;
};

function postToExtension<T = unknown>(action: string, payload: Record<string, unknown> = {}, expectedAction?: string): Promise<T | null> {
  return new Promise((resolve) => {
    const requestId = `${action}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const onMessage = (e: MessageEvent) => {
      if (e.source !== window) return;
      const d = e.data as any;
      if (
        d?.source === "rataria-extension" &&
        (!expectedAction || d.action === expectedAction) &&
        d.requestId === requestId
      ) {
        window.removeEventListener("message", onMessage);
        resolve(d.response as T);
      }
    };
    window.addEventListener("message", onMessage);
    window.postMessage({ source: "rataria-panel", action, requestId, ...payload }, window.location.origin);
    setTimeout(() => {
      window.removeEventListener("message", onMessage);
      resolve(null);
    }, 4000);
  });
}

function detectExtensionMarker(): boolean {
  return !!document.getElementById("__rataria_extension_installed__");
}

export default function AcessarFerramentas() {
  const navigate = useNavigate();
  const [extStatus, setExtStatus] = useState<ExtensionStatus | null>(null);
  const [acessos, setAcessos] = useState<Acesso[]>([]);
  const [loadingAcessos, setLoadingAcessos] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Auth gate
  useEffect(() => {
    const stored = localStorage.getItem("naut_subscription");
    if (!stored) {
      navigate("/usuario?redirect=/acessar-ferramentas", { replace: true });
      return;
    }
    const subData = getSubscriptionFromStorage();
    const activeSub = getActiveSubscription(subData);
    if (!activeSub) {
      navigate("/usuario?redirect=/acessar-ferramentas", { replace: true });
      return;
    }
    if (isTemporarySubscription(activeSub)) {
      navigate("/painel-temp", { replace: true });
    }
  }, [navigate]);

  // Detecta extensão (poll a cada 1.5s até achar)
  useEffect(() => {
    let mounted = true;
    let attempts = 0;

    const probe = async () => {
      if (!mounted) return;
      attempts++;

      if (detectExtensionMarker()) {
        const res = await postToExtension<ExtensionStatus>("status", {}, "status-response");
        if (mounted) setExtStatus(res || { ok: true });
        return;
      }

      const pong = await postToExtension<{ version?: string }>("ping", {}, "pong");
      if (pong) {
        if (mounted) setExtStatus({ ok: true, version: pong.version });
      } else if (attempts < 40) {
        setTimeout(probe, 1500);
      } else if (mounted) {
        setExtStatus({ ok: false });
      }
    };

    probe();
    return () => {
      mounted = false;
    };
  }, []);

  // Carrega credenciais do Supabase (busca inicial + refresh manual)
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("acessos")
        .select("id, ferramenta, login, senha, email_cliente, data_expiracao, totp_secret")
        .in("ferramenta", MVP_TOOLS.map((t) => t.key))
        .gt("data_expiracao", new Date().toISOString())
        .order("data_expiracao", { ascending: false });
      if (!mounted) return;
      if (error) {
        console.error(error);
        toast({ title: "Erro ao carregar ferramentas", description: error.message, variant: "destructive" });
      }
      setAcessos((data || []) as Acesso[]);
      setLoadingAcessos(false);
    })();
    return () => {
      mounted = false;
    };
  }, [reloadKey]);

  // Re-busca acessos quando a aba volta a ficar visível (cliente foi cadastrar 2FA
  // em outra aba e voltou)
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible") {
        setReloadKey(k => k + 1);
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  // Realtime: escuta mudanças em acessos e proxies. Quando admin altera
  // qualquer linha, esse painel re-busca + re-sincroniza com a extensão.
  // Debounce de 500ms pra agrupar bursts de updates.
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const fire = (source: string) => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        console.log(`[RatarIA] realtime: mudança em ${source}, re-sincronizando`);
        setReloadKey(k => k + 1);
      }, 500);
    };

    const channel = supabase
      .channel("rataria-painel-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "acessos" },
        () => fire("acessos")
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "proxies" },
        () => fire("proxies")
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("[RatarIA] realtime: conectado");
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.warn("[RatarIA] realtime: erro na conexão", status);
        }
      });

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, []);

  // Agrupa por ferramenta
  const byFerramenta = useMemo(() => {
    const map: Record<string, Acesso[]> = {};
    for (const a of acessos) {
      (map[a.ferramenta] ||= []).push(a);
    }
    return map;
  }, [acessos]);

  // Sincroniza credenciais + proxy ativo com a extensão (envia batch)
  useEffect(() => {
    if (!extStatus?.ok) return;
    if (loadingAcessos) return;

    const credentials: Record<string, Array<{
      login: string | null;
      email_cliente: string | null;
      senha: string;
      data_expiracao: string;
      totp_secret: string | null;
    }>> = {};
    for (const tool of MVP_TOOLS) {
      credentials[tool.key] = (byFerramenta[tool.key] || []).map((a) => ({
        login: a.login,
        email_cliente: a.email_cliente,
        senha: a.senha,
        data_expiracao: a.data_expiracao,
        totp_secret: a.totp_secret ?? null,
      }));
    }

    setSyncing(true);

    (async () => {
      // Busca proxy ativo (qualquer um, escolhe o primeiro)
      let proxy: {
        protocol: string;
        host: string;
        port: number;
        username: string | null;
        password: string | null;
        enabled: boolean;
      } | null = null;
      try {
        const { data } = await supabase
          .from("proxies")
          .select("protocol, host, port, username, password, ativo")
          .eq("ativo", true)
          .limit(1)
          .maybeSingle();
        if (data) {
          proxy = {
            protocol: data.protocol,
            host: data.host,
            port: data.port,
            username: data.username,
            password: data.password,
            enabled: true,
          };
        }
      } catch (e) {
        console.error("[RatarIA] erro ao buscar proxy:", e);
      }

      const res = await postToExtension<{ ok: boolean }>(
        "sync-credentials",
        { credentials, proxy },
        "sync-response"
      );
      setSyncing(false);
      if (res?.ok) {
        setExtStatus((s) => (s ? { ...s, syncedAt: Date.now() } : s));
      } else {
        toast({
          title: "Não consegui sincronizar com a extensão",
          description: "Recarregue a página ou reinstale a extensão.",
          variant: "destructive",
        });
      }
    })();
  }, [extStatus?.ok, loadingAcessos, byFerramenta]);

  async function handleOpen(ferramenta: string) {
    if (!extStatus?.ok) {
      toast({ title: "Instale a extensão", description: "Você precisa instalar a extensão da RatarIA." });
      return;
    }
    const tool = MVP_TOOLS.find((t) => t.key === ferramenta);
    if (!tool) return;
    if (!(byFerramenta[ferramenta] || []).length) {
      toast({
        title: "Nenhuma conta disponível",
        description: "Aguarde a equipe cadastrar uma conta nova.",
        variant: "destructive",
      });
      return;
    }
    if (tool.loginUrl) {
      // Abre direto (mais rápido)
      window.open(tool.loginUrl, "_blank", "noopener");
    } else {
      // Gemini precisa passar pelo background pra forçar logout antes
      const res = await postToExtension<{ ok: boolean; error?: string }>(
        "open-tool",
        { ferramenta, clearCookies: true },
        "open-tool-response"
      );
      if (!res?.ok) {
        toast({ title: "Falha ao abrir", description: res?.error || "tente novamente", variant: "destructive" });
        return;
      }
    }
    toast({
      title: `${tool.name} abrindo...`,
      description: "Na página de login, clique no ícone da RatarIA dentro do campo de e-mail.",
    });
  }

  const extInstalled = extStatus?.ok === true;

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <NeuralBackground />
      <div className="relative z-10 flex-1 px-5 md:px-8 pt-10 md:pt-14 pb-16">
        <div className="mx-auto w-full max-w-md md:max-w-2xl space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/painel")}
              className="flex items-center gap-2 text-xs text-white/50 hover:text-white/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <button
              onClick={() => setReloadKey(k => k + 1)}
              disabled={syncing || loadingAcessos}
              className="flex items-center gap-1.5 text-xs text-white/55 hover:text-white/90 px-3 py-1.5 rounded-lg border border-white/8 hover:border-white/15 bg-white/3 transition-all disabled:opacity-50"
              title="Recarregar e sincronizar com a extensão"
            >
              <RefreshCcw className={`w-3 h-3 ${syncing || loadingAcessos ? "animate-spin" : ""}`} />
              Sincronizar
            </button>
          </div>

          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold"
              style={{ background: "rgba(168, 85, 247, 0.12)", border: "1px solid rgba(168, 85, 247, 0.3)", color: "rgba(168, 85, 247, 0.92)" }}>
              <Sparkles className="w-3 h-3" /> Acesso Rápido
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white">Login automático nas ferramentas</h1>
            <p className="text-xs md:text-sm text-white/45 max-w-md mx-auto">
              Abra a ferramenta e clique no <strong className="text-white/70">ícone da RatarIA</strong> dentro do campo de e-mail pra escolher uma conta.
            </p>
          </div>

          {/* Status da extensão */}
          <AnimatePresence mode="wait">
            {extStatus === null && (
              <motion.div
                key="checking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 rounded-2xl px-4 py-3.5 border border-white/10 bg-white/5"
              >
                <Loader2 className="w-4 h-4 animate-spin text-white/60" />
                <span className="text-xs text-white/60">Verificando extensão...</span>
              </motion.div>
            )}

            {extStatus && !extStatus.ok && (
              <motion.div
                key="missing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl p-5 space-y-3"
                style={{
                  background: "linear-gradient(135deg, rgba(239, 168, 68, 0.08), rgba(239, 168, 68, 0.02))",
                  border: "1px solid rgba(239, 168, 68, 0.25)",
                }}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "rgba(239, 168, 68, 0.95)" }} />
                  <div className="flex-1">
                    <h3 className="text-sm font-bold" style={{ color: "rgba(239, 168, 68, 0.95)" }}>
                      Instale a extensão da RatarIA
                    </h3>
                    <p className="text-xs mt-1 text-white/55 leading-relaxed">
                      Sem ela o login automático não funciona. Demora menos de 1 minuto pra instalar.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => window.open("/extensao/rataria-extension.zip", "_blank")}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  style={{
                    background: "rgba(239, 168, 68, 0.15)",
                    border: "1px solid rgba(239, 168, 68, 0.35)",
                    color: "rgba(239, 168, 68, 0.95)",
                  }}
                >
                  <Download className="w-4 h-4" /> Baixar extensão (.zip)
                </button>
                <a
                  href="https://wa.me/5511922926559?text=Preciso%20de%20ajuda%20para%20instalar%20a%20extens%C3%A3o"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-[11px] text-white/50 hover:text-white/80 underline-offset-2 hover:underline"
                >
                  Ajuda na instalação
                </a>
              </motion.div>
            )}

            {extInstalled && (
              <motion.div
                key="installed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{
                  background: "rgba(34, 197, 94, 0.08)",
                  border: "1px solid rgba(34, 197, 94, 0.22)",
                }}
              >
                {syncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: "rgba(34, 197, 94, 0.85)" }} />
                ) : (
                  <CheckCircle2 className="w-4 h-4" style={{ color: "rgba(34, 197, 94, 0.95)" }} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold" style={{ color: "rgba(34, 197, 94, 0.95)" }}>
                    {syncing ? "Sincronizando contas..." : "Extensão conectada e contas sincronizadas"}
                  </div>
                  {extStatus?.version && (
                    <div className="text-[10.5px] text-white/35 font-mono">v{extStatus.version}</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid de ferramentas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {MVP_TOOLS.map((tool) => {
              const accounts = byFerramenta[tool.key] || [];
              const has = accounts.length > 0;
              const disabled = !extInstalled || !has;
              return (
                <motion.button
                  key={tool.key}
                  whileHover={!disabled ? { scale: 1.02 } : {}}
                  whileTap={!disabled ? { scale: 0.98 } : {}}
                  onClick={() => handleOpen(tool.key)}
                  disabled={disabled}
                  className="relative text-left rounded-2xl p-4 md:p-5 transition-opacity"
                  style={{
                    background: `linear-gradient(135deg, rgba(${tool.accent}, 0.12), rgba(${tool.accent}, 0.03))`,
                    border: `1px solid rgba(${tool.accent}, 0.25)`,
                    opacity: disabled ? 0.55 : 1,
                    cursor: disabled ? "not-allowed" : "pointer",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center overflow-hidden shrink-0"
                      style={{ background: `rgba(${tool.accent}, 0.15)` }}
                    >
                      <img src={tool.logo} alt={tool.name} className="w-8 h-8 md:w-9 md:h-9 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm md:text-base font-bold text-white">{tool.name}</p>
                      <p className="text-[11px] md:text-xs mt-0.5 text-white/45">
                        {!extInstalled
                          ? "Instale a extensão"
                          : loadingAcessos
                          ? "Carregando..."
                          : !has
                          ? "Sem conta disponível"
                          : `${accounts.length} ${accounts.length === 1 ? "conta" : "contas"} pra usar`}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4" style={{ color: `rgba(${tool.accent}, 0.65)` }} />
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* How-it-works mini-guia */}
          <div className="rounded-2xl p-4 md:p-5 space-y-3"
            style={{ background: "rgba(255, 255, 255, 0.025)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
            <div className="flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-white/55" />
              <span className="text-[10.5px] uppercase tracking-wider font-bold text-white/55">Como usar</span>
            </div>
            <ol className="space-y-2 text-[12px] text-white/65 leading-relaxed">
              <li><strong className="text-white/85">1.</strong> Clica numa ferramenta acima — abre a página de login.</li>
              <li><strong className="text-white/85">2.</strong> Dentro do campo de e-mail vai aparecer um ícone roxo da RatarIA.</li>
              <li><strong className="text-white/85">3.</strong> Clica no ícone e escolhe a conta que quer usar.</li>
              <li><strong className="text-white/85">4.</strong> E-mail e senha preenchem sozinhos. Clica "Continuar" pra entrar.</li>
            </ol>
          </div>

          <p className="text-[11px] text-center text-white/30">
            Mais ferramentas chegam em breve.
          </p>
        </div>
      </div>
    </div>
  );
}
