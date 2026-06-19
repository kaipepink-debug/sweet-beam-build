import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Download, AlertTriangle, Sparkles, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getSubscriptionFromStorage, getActiveSubscription, isTemporarySubscription } from "@/lib/isTemporarySub";
import NeuralBackground from "@/components/sales/NeuralBackground";

import chatgptLogo from "@/assets/tools/chatgpt.png";
import geminiLogo from "@/assets/tools/gemini.png";

const MVP_TOOLS = [
  { key: "chatgpt", name: "ChatGPT", logo: chatgptLogo, accent: "139, 92, 246" },
  { key: "gemini", name: "Gemini", logo: geminiLogo, accent: "59, 130, 246" },
];

type Acesso = {
  id: string;
  ferramenta: string;
  login: string;
  senha: string;
  data_expiracao: string;
};

function detectExtension(timeoutMs = 600): Promise<boolean> {
  return new Promise((resolve) => {
    // Sinalizador injetado pelo panel-bridge da extensão
    if (document.getElementById("__rataria_extension_installed__")) {
      resolve(true);
      return;
    }
    const requestId = `det-${Date.now()}`;
    const onMessage = (e: MessageEvent) => {
      if (e.source !== window) return;
      const d = e.data as any;
      if (d?.source === "rataria-extension" && d.action === "pong" && d.requestId === requestId) {
        window.removeEventListener("message", onMessage);
        resolve(true);
      }
    };
    window.addEventListener("message", onMessage);
    window.postMessage({ source: "rataria-panel", action: "ping", requestId }, window.location.origin);
    setTimeout(() => {
      window.removeEventListener("message", onMessage);
      resolve(!!document.getElementById("__rataria_extension_installed__"));
    }, timeoutMs);
  });
}

function sendToExtension(payload: {
  ferramenta: string;
  login: string;
  senha: string;
  totpSecret?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    const requestId = `open-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const onMessage = (e: MessageEvent) => {
      if (e.source !== window) return;
      const d = e.data as any;
      if (
        d?.source === "rataria-extension" &&
        d.action === "open-tool-response" &&
        d.requestId === requestId
      ) {
        window.removeEventListener("message", onMessage);
        resolve(d.response || { ok: false, error: "sem resposta" });
      }
    };
    window.addEventListener("message", onMessage);
    window.postMessage(
      { source: "rataria-panel", action: "open-tool", requestId, ...payload },
      window.location.origin
    );
    setTimeout(() => {
      window.removeEventListener("message", onMessage);
      resolve({ ok: false, error: "timeout" });
    }, 5000);
  });
}

export default function AcessarFerramentas() {
  const navigate = useNavigate();
  const [extInstalled, setExtInstalled] = useState<boolean | null>(null);
  const [openingTool, setOpeningTool] = useState<string | null>(null);
  const [acessos, setAcessos] = useState<Acesso[]>([]);
  const [loadingAcessos, setLoadingAcessos] = useState(true);

  // Auth gate: cliente precisa ter assinatura ativa no localStorage (Naut)
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
      // Assinaturas temporárias (logins de 30min) não podem usar a extensão
      navigate("/painel-temp", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    let mounted = true;
    detectExtension().then((ok) => mounted && setExtInstalled(ok));
    // Re-checa a cada 2s — útil quando o usuário acabou de instalar
    const interval = setInterval(async () => {
      const ok = await detectExtension(300);
      if (mounted) setExtInstalled(ok);
    }, 2500);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("acessos")
        .select("id, ferramenta, login, senha, data_expiracao")
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
  }, []);

  // Mapa: ferramenta → acesso mais distante de expirar (escolha mais "fresca")
  const acessoByFerramenta = useMemo(() => {
    const map: Record<string, Acesso> = {};
    for (const a of acessos) {
      if (!map[a.ferramenta]) map[a.ferramenta] = a;
    }
    return map;
  }, [acessos]);

  async function handleOpen(ferramenta: string) {
    if (!extInstalled) {
      toast({ title: "Extensão não detectada", description: "Instale a extensão da RatarIA primeiro." });
      return;
    }
    const acesso = acessoByFerramenta[ferramenta];
    if (!acesso) {
      toast({
        title: "Nenhum acesso disponível",
        description: "Aguarde a equipe cadastrar uma nova conta para essa ferramenta.",
        variant: "destructive",
      });
      return;
    }
    setOpeningTool(ferramenta);
    const res = await sendToExtension({
      ferramenta,
      login: acesso.login,
      senha: acesso.senha,
    });
    setOpeningTool(null);
    if (!res.ok) {
      toast({
        title: "Falha ao abrir ferramenta",
        description: res.error || "Tente recarregar a página e tentar de novo.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Abrindo ferramenta...", description: "Acompanhe o progresso na nova aba." });
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <NeuralBackground />
      <div className="relative z-10 flex-1 px-5 md:px-8 pt-10 md:pt-14 pb-16">
        <div className="mx-auto w-full max-w-md md:max-w-2xl space-y-6">
          <button
            onClick={() => navigate("/painel")}
            className="flex items-center gap-2 text-xs text-white/50 hover:text-white/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>

          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold"
              style={{ background: "rgba(139, 92, 246, 0.12)", border: "1px solid rgba(139, 92, 246, 0.3)", color: "rgba(139, 92, 246, 0.9)" }}>
              <Sparkles className="w-3 h-3" /> Acesso Rápido
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white">Acessar Ferramentas com 1 Clique</h1>
            <p className="text-xs md:text-sm text-white/45">
              Clique na ferramenta e a extensão da RatarIA loga sozinha pra você.
            </p>
          </div>

          {/* Status da extensão */}
          <AnimatePresence mode="wait">
            {extInstalled === null && (
              <motion.div
                key="checking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 rounded-2xl px-4 py-3.5 border border-white/10 bg-white/5"
              >
                <Loader2 className="w-4 h-4 animate-spin text-white/60" />
                <span className="text-xs text-white/60">Verificando se a extensão está instalada...</span>
              </motion.div>
            )}

            {extInstalled === false && (
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
                      Pra abrir as ferramentas com um clique, você precisa instalar nossa extensão no Chrome.
                      Demora menos de 1 minuto.
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
                  Precisa de ajuda na instalação? Falar com suporte
                </a>
              </motion.div>
            )}

            {extInstalled === true && (
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
                <div className="w-2 h-2 rounded-full" style={{ background: "rgba(34, 197, 94, 0.95)", boxShadow: "0 0 8px rgba(34, 197, 94, 0.6)" }} />
                <span className="text-xs font-medium" style={{ color: "rgba(34, 197, 94, 0.95)" }}>
                  Extensão conectada. Pronto pra acessar.
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid de ferramentas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {MVP_TOOLS.map((tool) => {
              const acesso = acessoByFerramenta[tool.key];
              const isOpening = openingTool === tool.key;
              const disabled = !extInstalled || !acesso || isOpening;

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
                        {isOpening
                          ? "Abrindo..."
                          : !acesso
                          ? loadingAcessos
                            ? "Carregando..."
                            : "Sem conta disponível"
                          : "Pronto pra abrir"}
                      </p>
                    </div>
                    {isOpening ? (
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: `rgba(${tool.accent}, 0.85)` }} />
                    ) : (
                      <ExternalLink className="w-4 h-4" style={{ color: `rgba(${tool.accent}, 0.65)` }} />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          <p className="text-[11px] text-center text-white/30 pt-2">
            Mais ferramentas vão aparecer aqui em breve.
          </p>
        </div>
      </div>
    </div>
  );
}
