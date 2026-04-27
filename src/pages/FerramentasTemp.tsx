import { useState, useEffect, useCallback, useMemo } from "react";
import { Copy, Eye, Download, KeyRound, ExternalLink, AlertTriangle, CheckCircle2, ArrowLeft, Loader2, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import * as OTPAuth from "otpauth";
import { getSubscriptionFromStorage, getActiveSubscription, isTemporarySubscription } from "@/lib/isTemporarySub";

const TOTP_PERIOD = 30;

function fallbackCopy(text: string) {
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  } catch (e) {
    console.error("Fallback copy failed:", e);
  }
}

function formatTime(ms: number) {
  if (ms <= 0) return "00:00";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function FerramentasTemp() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<{ login: string; senha: string; totp_secret: string; video_url: string; dicloak_url: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [clockOffset, setClockOffset] = useState(0); // serverTime - clientTime (ms)

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

  useEffect(() => {
    (supabase as any)
      .from("configuracoes_acesso_temp")
      .select("login, senha, totp_secret, video_url, dicloak_url")
      .limit(1)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data) setConfig(data);
        setLoading(false);
      });
  }, []);

  // Calcula offset do relógio do cliente vs servidor (corrige TOTP em PCs com hora errada)
  useEffect(() => {
    const fetchServerTime = async () => {
      try {
        const t0 = Date.now();
        const res = await fetch(window.location.origin + "/", { method: "HEAD", cache: "no-store" });
        const t1 = Date.now();
        const dateHeader = res.headers.get("date");
        if (!dateHeader) return;
        const serverTime = new Date(dateHeader).getTime();
        const rtt = t1 - t0;
        const estimatedServerNow = serverTime + rtt / 2;
        const offset = estimatedServerNow - t1;
        setClockOffset(offset);
      } catch (e) {
        console.warn("Could not sync clock with server:", e);
      }
    };
    fetchServerTime();
  }, []);

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary relative z-10" />
      </div>
    );
  }

  if (!config) return null;

  return <FerramentasTempContent config={config} navigate={navigate} activeSub={activeSub} clockOffset={clockOffset} />;
}

function FerramentasTempContent({
  config,
  navigate,
  activeSub,
  clockOffset,
}: {
  config: { login: string; senha: string; totp_secret: string; video_url: string; dicloak_url: string };
  navigate: ReturnType<typeof useNavigate>;
  activeSub: any;
  clockOffset: number;
}) {
  const totp = useMemo(() => {
    try {
      const cleanSecret = (config.totp_secret || "").replace(/\s+/g, "").toUpperCase();
      if (!cleanSecret) return null;
      return new OTPAuth.TOTP({
        issuer: "app",
        label: "user",
        algorithm: "SHA1",
        digits: 6,
        period: TOTP_PERIOD,
        secret: OTPAuth.Secret.fromBase32(cleanSecret),
      });
    } catch (e) {
      console.error("Invalid TOTP secret:", e);
      return null;
    }
  }, [config.totp_secret]);

  const generateCode = useCallback(() => {
    if (!totp) return "------";
    try {
      return totp.generate({ timestamp: Date.now() + clockOffset });
    } catch (e) {
      console.error("TOTP generate error:", e);
      return "------";
    }
  }, [totp, clockOffset]);
  const getTimeLeft = useCallback(
    () => TOTP_PERIOD - (Math.floor((Date.now() + clockOffset) / 1000) % TOTP_PERIOD),
    [clockOffset]
  );

  const [code, setCode] = useState<string>(() => generateCode());
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [revealed, setRevealed] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeLeft();
      setTimeLeft(remaining);
      setNow(Date.now());
      // Regenera sempre que entra em novo ciclo (mantém revelado se já estava)
      setCode((prev) => {
        const fresh = generateCode();
        return fresh !== prev ? fresh : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [generateCode, getTimeLeft]);

  // Countdown of the temp session (30 min)
  const expiresMs = activeSub?.expiresAt ? new Date(activeSub.expiresAt).getTime() : 0;
  const remainingSession = expiresMs - now;

  useEffect(() => {
    if (expiresMs && remainingSession <= 0) {
      localStorage.removeItem("naut_subscription");
      navigate("/usuario", { replace: true });
    }
  }, [expiresMs, remainingSession, navigate]);

  const lowTime = remainingSession > 0 && remainingSession < 5 * 60 * 1000;

  const copyToClipboard = useCallback((text: string, label: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
      } else {
        fallbackCopy(text);
      }
      toast({ title: `${label} copiado!`, duration: 2000 });
    } catch (e) {
      console.error("Copy error:", e);
      fallbackCopy(text);
      toast({ title: `${label} copiado!`, duration: 2000 });
    }
  }, []);

  const handleRevealOrCopy = useCallback(() => {
    if (timeLeft <= 5) {
      toast({
        title: "Aguarde o próximo código",
        description: `Faltam ${timeLeft}s para expirar. Aguarde um novo código para evitar erro no DiCloak.`,
        duration: 3000,
      });
      return;
    }
    if (!revealed) setRevealed(true);
    copyToClipboard(code, "Código");
  }, [timeLeft, revealed, code, copyToClipboard]);

  const progressPercent = (timeLeft / TOTP_PERIOD) * 100;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4">
      <div className="relative z-10 w-full max-w-lg py-10 space-y-5">
        <button onClick={() => navigate("/painel-temp")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        {/* Countdown da sessão temporária */}
        <div
          className={`rounded-2xl px-5 py-4 flex items-center gap-4 border ${lowTime ? "bg-destructive/10 border-destructive/30" : "bg-primary/10 border-primary/20"}`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${lowTime ? "bg-destructive/15" : "bg-primary/15"}`}
          >
            <Clock className={`w-6 h-6 ${lowTime ? "text-red-400" : "text-primary"}`} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">Tempo restante de acesso</p>
            <p className={`text-xl md:text-2xl font-bold tabular-nums ${lowTime ? "text-red-400" : "text-primary"}`}>
              {formatTime(Math.max(0, remainingSession))}
            </p>
          </div>
        </div>

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
              <video controls playsInline preload="metadata" className="w-full rounded-xl" poster="">
                <source src={config.video_url} type="video/mp4" />
                Seu navegador não suporta vídeos.
              </video>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="rounded-2xl p-5 space-y-3" style={glassStyle}>
          <StepHeader num={2} title="Baixe o navegador DiCloak" />
          <p className="text-sm text-muted-foreground pl-9">Faça o download do navegador oficial para acessar o painel.</p>
          <a href={config.dicloak_url} target="_blank" rel="noopener noreferrer"
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
            <p className={`text-xs ${timeLeft <= 5 ? "text-red-400 font-semibold" : "text-muted-foreground"}`}>
              {timeLeft <= 5 ? `Expirando em ${timeLeft}s — aguarde o próximo` : `Expira em ${timeLeft}s`}
            </p>
            <button
              type="button"
              onClick={handleRevealOrCopy}
              disabled={timeLeft <= 5}
              className="relative w-full py-3 rounded-xl text-sm font-semibold uppercase tracking-widest transition-colors duration-300 bg-primary/15 hover:bg-primary/25 border border-primary/40 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                {revealed ? <Copy className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {timeLeft <= 5 ? "Aguardando novo código..." : revealed ? "Copiar código" : "Revelar código"}
              </span>
            </button>
          </div>

          {Math.abs(clockOffset) > 10000 && (
            <div className="flex items-start gap-3 rounded-xl p-3.5" style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-foreground/90 leading-snug">
                <span className="text-red-400">Relógio do seu computador está dessincronizado em {Math.round(clockOffset / 1000)}s.</span>{" "}
                O código já foi corrigido automaticamente, mas se der erro, ajuste o horário do Windows (Configurações → Hora e Idioma → Sincronizar agora).
              </p>
            </div>
          )}

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
