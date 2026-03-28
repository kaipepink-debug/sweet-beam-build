import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Copy, Eye, Download, KeyRound, ExternalLink, AlertTriangle, CheckCircle2, ArrowLeft, Loader2, Play } from "lucide-react";
import NeuralBackground from "@/components/sales/NeuralBackground";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import * as OTPAuth from "otpauth";

const TOTP_PERIOD = 30;

export default function Ferramentas() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<{ login: string; senha: string; totp_secret: string; video_url: string; dicloak_url: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Check naut_subscription session
  useEffect(() => {
    const stored = localStorage.getItem("naut_subscription");
    if (!stored) {
      navigate("/usuario?redirect=/ferramentas", { replace: true });
      return;
    }
  }, [navigate]);

  useEffect(() => {
    supabase
      .from("configuracoes_acesso")
      .select("login, senha, totp_secret, video_url, dicloak_url")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setConfig(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-background">
        <NeuralBackground />
        <Loader2 className="h-8 w-8 animate-spin text-primary relative z-10" />
      </div>
    );
  }

  if (!config) return null;

  return <FerramentasContent config={config} navigate={navigate} />;
}

function FerramentasContent({ config, navigate }: { config: { login: string; senha: string; totp_secret: string; video_url: string; dicloak_url: string }; navigate: ReturnType<typeof useNavigate> }) {
  const totp = useMemo(() => new OTPAuth.TOTP({
    issuer: "app",
    label: "user",
    algorithm: "SHA1",
    digits: 6,
    period: TOTP_PERIOD,
    secret: OTPAuth.Secret.fromBase32(config.totp_secret),
  }), [config.totp_secret]);

  const generateCode = useCallback(() => totp.generate(), [totp]);
  const getTimeLeft = useCallback(() => TOTP_PERIOD - (Math.floor(Date.now() / 1000) % TOTP_PERIOD), []);

  const [code, setCode] = useState(generateCode());
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeLeft();
      setTimeLeft(remaining);
      if (remaining === TOTP_PERIOD) {
        setCode(generateCode());
        setRevealed(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [generateCode, getTimeLeft]);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copiado!`, duration: 2000 });
  }, []);

  const progressPercent = (timeLeft / TOTP_PERIOD) * 100;

  const glassStyle = {
    background: "rgba(10, 10, 10, 0.75)",
    backdropFilter: "blur(30px)",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      <NeuralBackground />
      <div className="fixed inset-0 z-[1] pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, hsla(270, 100%, 50%, 0.04) 0%, transparent 60%)" }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-lg mx-4 py-10 space-y-5"
      >
        <button onClick={() => navigate("/painel")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="text-center space-y-2">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            Passo a passo para acessar as Ferramentas de IA
          </h1>
          <p className="text-sm text-muted-foreground">Siga os passos abaixo para liberar seu acesso</p>
        </div>

        {/* Step 1 - Tutorial */}
        <div className="rounded-2xl p-5 space-y-3" style={glassStyle}>
          <StepHeader num={1} title="Assista o tutorial" />
          <p className="text-sm text-muted-foreground pl-9">Veja o vídeo abaixo para entender como acessar as ferramentas.</p>
          <div className="pl-9">
            <div className="rounded-xl overflow-hidden" style={{ background: "rgba(0,0,0,0.4)" }}>
              <video
                controls
                playsInline
                preload="metadata"
                className="w-full rounded-xl"
                poster=""
              >
                <source src="/videos/diclaok.mp4" type="video/mp4" />
                Seu navegador não suporta vídeos.
              </video>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="rounded-2xl p-5 space-y-3" style={glassStyle}>
          <StepHeader num={2} title="Baixe o navegador DiCloak" />
          <p className="text-sm text-muted-foreground pl-9">Faça o download do navegador oficial para acessar o painel.</p>
          <a href="https://dicloak.com/pt/download" target="_blank" rel="noopener noreferrer"
            className="ml-9 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors">
            <Download className="w-4 h-4" /> Baixar DiCloak <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>

        {/* Step 3 */}
        <div className="rounded-2xl p-5 space-y-3" style={glassStyle}>
          <StepHeader num={3} title="Abra o DiCloak e insira o login" />
          <p className="text-sm text-muted-foreground pl-9">Com o programa aberto, use as credenciais abaixo:</p>
          <div className="space-y-2 pl-9">
            <CredentialRow label="Usuário" value={config.login} onCopy={() => copyToClipboard(config.login, "Usuário")} />
            <CredentialRow label="Senha" value={config.senha} onCopy={() => copyToClipboard(config.senha, "Senha")} />
          </div>
        </div>

        {/* Step 4 - 2FA */}
        <div className="rounded-2xl p-5 space-y-4" style={glassStyle}>
          <StepHeader num={4} title="Insira o código de 2 Fatores" />
          <p className="text-sm text-muted-foreground pl-9">O sistema irá solicitar um código de autenticação. Clique abaixo para revelar e copiar.</p>

          <div className="rounded-xl p-5 text-center space-y-3" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
              <KeyRound className="w-3.5 h-3.5" /> Código de Autenticação
            </div>
            <div className="text-3xl font-bold tracking-[0.3em] text-foreground" style={{ fontFamily: "monospace" }}>
              {revealed ? code : "••••••"}
            </div>
            <div className="relative w-48 h-1.5 mx-auto rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <motion.div className="absolute inset-y-0 left-0 rounded-full bg-primary" animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.5, ease: "linear" }} />
            </div>
            <p className="text-xs text-muted-foreground">Expira em {timeLeft}s</p>
            <button
              onClick={() => { if (!revealed) { setRevealed(true); copyToClipboard(code, "Código"); } else { copyToClipboard(code, "Código"); } }}
              className="neon-border-btn relative w-full py-3 rounded-xl text-sm font-semibold uppercase tracking-widest transition-all duration-300 overflow-hidden"
              style={{ background: "transparent" }}
            >
              <span className="neon-trail" style={{ borderRadius: "0.75rem" }} />
              <span className="relative z-10 flex items-center justify-center gap-2 text-foreground">
                {revealed ? <Copy className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {revealed ? "Copiar código" : "Revelar código"}
              </span>
            </button>
          </div>

          <div className="flex items-start gap-3 rounded-xl p-3.5" style={{ background: "hsla(270, 100%, 50%, 0.08)", border: "1px solid hsla(270, 100%, 50%, 0.25)" }}>
            <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-foreground/90 leading-snug">
              Se aparecer <span className="text-primary">código incorreto</span>, atualize a página e copie o novo código.
            </p>
          </div>
        </div>

        {/* Step 5 */}
        <div className="rounded-2xl p-5 space-y-2" style={glassStyle}>
          <StepHeader num={5} title="Pronto! Acesse o painel" icon="check" />
          <p className="text-sm text-muted-foreground pl-9">
            Basta acessar o painel com as ferramentas. Em caso de dúvidas, entre em contato que auxiliamos todo o acesso!
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function StepHeader({ num, title, icon }: { num: number; title: string; icon?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${icon === "check" ? "bg-green-500/20 text-green-400" : "bg-primary/20 text-primary"}`}>
        {icon === "check" ? <CheckCircle2 className="w-4 h-4" /> : num}
      </div>
      <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">{title}</h2>
    </div>
  );
}

function CredentialRow({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.04)" }}>
      <span className="text-sm text-muted-foreground">
        <strong className="text-foreground">{label}:</strong> {value}
      </span>
      <button onClick={onCopy} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-foreground transition-all duration-200 hover:bg-primary/20" style={{ background: "rgba(255,255,255,0.08)" }}>
        <Copy className="w-3.5 h-3.5 inline mr-1" /> Copiar
      </button>
    </div>
  );
}
