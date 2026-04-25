import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, ExternalLink, Eye, EyeOff, Loader2, Clock, AlertTriangle, Wrench } from "lucide-react";
import NeuralBackground from "@/components/sales/NeuralBackground";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getSubscriptionFromStorage, getActiveSubscription, isTemporarySubscription } from "@/lib/isTemporarySub";

type AcessoTemp = {
  id: string;
  ferramenta: string;
  login: string;
  senha: string;
  url_acesso: string | null;
  observacoes: string | null;
};

function formatTime(ms: number) {
  if (ms <= 0) return "00:00";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function FerramentasTemp() {
  const navigate = useNavigate();
  const [acessos, setAcessos] = useState<AcessoTemp[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(Date.now());

  const subData = useMemo(() => getSubscriptionFromStorage(), []);
  const activeSub = useMemo(() => getActiveSubscription(subData), [subData]);

  // Guard: only temporary subscribers
  useEffect(() => {
    if (!subData) {
      navigate("/usuario?redirect=/ferramentas-temp", { replace: true });
      return;
    }
    if (!isTemporarySubscription(activeSub)) {
      navigate("/ferramentas", { replace: true });
    }
  }, [subData, activeSub, navigate]);

  // Countdown
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const expiresMs = activeSub?.expiresAt ? new Date(activeSub.expiresAt).getTime() : 0;
  const remaining = expiresMs - now;

  useEffect(() => {
    if (expiresMs && remaining <= 0) {
      localStorage.removeItem("naut_subscription");
      navigate("/usuario", { replace: true });
    }
  }, [expiresMs, remaining, navigate]);

  // Load tools
  useEffect(() => {
    supabase
      .from("acessos_temporarios")
      .select("id, ferramenta, login, senha, url_acesso, observacoes")
      .eq("ativo", true)
      .order("ferramenta", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          toast({ title: "Erro ao carregar ferramentas", variant: "destructive" });
        } else {
          setAcessos((data as AcessoTemp[]) || []);
        }
        setLoading(false);
      });
  }, []);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copiado!`, duration: 2000 });
  };

  const toggleReveal = (id: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const lowTime = remaining > 0 && remaining < 5 * 60 * 1000;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <NeuralBackground />

      <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-6 py-10 space-y-5">
        {/* Header */}
        <button
          onClick={() => navigate("/painel-temp")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        {/* Countdown */}
        <motion.div
          className="rounded-2xl px-5 py-4 flex items-center gap-4"
          style={{
            background: lowTime ? "rgba(239, 68, 68, 0.08)" : "rgba(59, 130, 246, 0.08)",
            border: `1px solid ${lowTime ? "rgba(239, 68, 68, 0.3)" : "rgba(59, 130, 246, 0.2)"}`,
            backdropFilter: "blur(20px)",
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: lowTime ? "rgba(239, 68, 68, 0.15)" : "rgba(59, 130, 246, 0.15)" }}
          >
            <Clock className="w-6 h-6" style={{ color: lowTime ? "rgba(248, 113, 113, 0.95)" : "rgba(96, 165, 250, 0.95)" }} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">Tempo restante de acesso</p>
            <p className="text-xl md:text-2xl font-bold tabular-nums" style={{ color: lowTime ? "rgba(248, 113, 113, 0.95)" : "rgba(96, 165, 250, 0.95)" }}>
              {formatTime(Math.max(0, remaining))}
            </p>
          </div>
        </motion.div>

        {/* Heading */}
        <div className="text-center space-y-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            Ferramentas Temporárias
          </h1>
          <p className="text-sm text-muted-foreground">
            Use as credenciais abaixo para acessar as ferramentas
          </p>
        </div>

        {/* Warning */}
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3"
          style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.25)" }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "rgba(252, 211, 77, 0.95)" }} />
          <p className="text-[11px] md:text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
            Estas credenciais são compartilhadas e mudam frequentemente. Use apenas durante o seu tempo de acesso.
          </p>
        </div>

        {/* Tools list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : acessos.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center space-y-2"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <Wrench className="w-10 h-10 mx-auto text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Nenhuma ferramenta temporária disponível no momento.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {acessos.map((a) => {
              const isVisible = revealed.has(a.id);
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-5 space-y-3"
                  style={{
                    background: "rgba(10, 10, 10, 0.75)",
                    backdropFilter: "blur(30px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-bold text-foreground capitalize">{a.ferramenta}</h3>
                    {a.url_acesso && (
                      <a
                        href={a.url_acesso}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                      >
                        Abrir <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <span className="text-sm text-muted-foreground truncate">
                        <strong className="text-foreground">Login:</strong> {a.login}
                      </span>
                      <button
                        onClick={() => copy(a.login, "Login")}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-foreground hover:bg-primary/20 transition-colors shrink-0"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                      >
                        <Copy className="w-3.5 h-3.5 inline mr-1" /> Copiar
                      </button>
                    </div>

                    <div className="flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <span className="text-sm text-muted-foreground truncate">
                        <strong className="text-foreground">Senha:</strong>{" "}
                        <span className="font-mono">{isVisible ? a.senha : "••••••••"}</span>
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => toggleReveal(a.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-foreground hover:bg-primary/20 transition-colors"
                          style={{ background: "rgba(255,255,255,0.08)" }}
                          aria-label={isVisible ? "Ocultar" : "Revelar"}
                        >
                          {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => copy(a.senha, "Senha")}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-foreground hover:bg-primary/20 transition-colors"
                          style={{ background: "rgba(255,255,255,0.08)" }}
                        >
                          <Copy className="w-3.5 h-3.5 inline mr-1" /> Copiar
                        </button>
                      </div>
                    </div>
                  </div>

                  {a.observacoes && (
                    <p className="text-[11px] text-muted-foreground border-t border-border/30 pt-2">
                      {a.observacoes}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
