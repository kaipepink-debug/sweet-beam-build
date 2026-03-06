import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Copy, Eye, EyeOff, ExternalLink, AlertTriangle, KeyRound } from "lucide-react";
import NeuralBackground from "@/components/sales/NeuralBackground";
import ratariaIcon from "@/assets/rataria-icon.png";
import { toast } from "@/hooks/use-toast";
import * as OTPAuth from "otpauth";

const TOTP_PERIOD = 30;
const TOTP_SECRET = "JBSWY3DPEHPK3PXP"; // Base32 secret key

const Cod = () => {
  const totp = useMemo(() => new OTPAuth.TOTP({
    issuer: "app",
    label: "user",
    algorithm: "SHA1",
    digits: 6,
    period: TOTP_PERIOD,
    secret: OTPAuth.Secret.fromBase32(TOTP_SECRET),
  }), []);

  const generateCode = useCallback(() => totp.generate(), [totp]);

  const getTimeLeft = useCallback(() => {
    return TOTP_PERIOD - (Math.floor(Date.now() / 1000) % TOTP_PERIOD);
  }, []);

  const [code, setCode] = useState(generateCode());
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeLeft();
      setTimeLeft(remaining);
      
      // When a new period starts, regenerate code
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

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      <NeuralBackground />
      <div className="fixed inset-0 z-[1] pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(180, 0, 255, 0.04) 0%, transparent 60%)" }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-4 space-y-5"
      >
        {/* Logo */}
        <div className="flex justify-center">
          <img src={ratariaIcon} alt="ratarIA" className="h-16 w-auto" style={{ filter: "brightness(1.1)" }} />
        </div>

        {/* Title */}
        <h1 className="text-xl md:text-2xl font-light tracking-tight text-center text-foreground">
          Use as informações abaixo para acessar
        </h1>

        {/* Steps Card */}
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{
            background: "rgba(10, 10, 10, 0.75)",
            backdropFilter: "blur(30px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Step num="1º" bold="BAIXAR O MULTILOGIN DICLOACK!">
            <a href="#" className="text-primary hover:underline font-semibold text-sm flex items-center gap-1">
              CLIQUE AQUI <ExternalLink className="w-3 h-3" />
            </a>
          </Step>

          <Step num="2º" bold="ENTRE EM NOSSO CANAL DE AVISOS!">
            <a href="#" className="text-primary hover:underline font-semibold text-sm flex items-center gap-1">
              CLIQUE AQUI <ExternalLink className="w-3 h-3" />
            </a>
          </Step>

          <Step num="3º" bold="INSIRA O NOSSO LOGIN E SENHA DE ACESSO:" />

          <div className="space-y-2.5 pl-1">
            <CredentialRow label="Login" value="rataria.io" onCopy={() => copyToClipboard("rataria.io", "Login")} />
            <CredentialRow label="Senha" value="2026@Rataria.io" onCopy={() => copyToClipboard("2026@Rataria.io", "Senha")} />
          </div>

          <Step num="4º" bold="DEIXE SELECIONADO A OPÇÃO">
            <span className="text-foreground/90 text-sm">
              <strong>AUTENTICADOR</strong> E CLIQUE EM REVELAR CÓDIGO ABAIXO!
            </span>
          </Step>

          {/* Warning */}
          <div
            className="flex items-start gap-3 rounded-xl p-3.5"
            style={{
              background: "rgba(180, 0, 255, 0.08)",
              border: "1px solid rgba(180, 0, 255, 0.25)",
            }}
          >
            <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-foreground/90 uppercase leading-snug">
              Caso aparecer <span className="text-primary">código incorreto</span> clique em atualizar essa página e copie o novo código!
            </p>
          </div>
        </div>

        {/* Auth Code Card */}
        <div
          className="rounded-2xl p-6 text-center space-y-4"
          style={{
            background: "rgba(10, 10, 10, 0.75)",
            backdropFilter: "blur(30px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h2 className="text-lg font-bold text-foreground tracking-tight">Código de Acesso</h2>
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <KeyRound className="w-4 h-4" />
            Código de Autenticação
          </div>

          {/* Code display */}
          <div className="text-3xl font-bold tracking-[0.3em] text-foreground py-2" style={{ fontFamily: "monospace" }}>
            {revealed ? code : "••••••"}
          </div>

          {/* Progress bar */}
          <div className="relative w-48 h-1.5 mx-auto rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-primary"
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Código expira em {timeLeft} segundos
          </p>

          {/* Reveal button */}
          <button
            onClick={() => {
              setRevealed(!revealed);
              if (!revealed) copyToClipboard(code, "Código");
            }}
            className="neon-border-btn relative w-full py-3 rounded-xl text-sm font-semibold uppercase tracking-widest transition-all duration-300 overflow-hidden"
            style={{ background: "transparent" }}
          >
            <span className="neon-trail" style={{ borderRadius: "0.75rem" }} />
            <span className="relative z-10 flex items-center justify-center gap-2 text-foreground">
              {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {revealed ? "Ocultar código" : "Revelar código"}
            </span>
          </button>
        </div>

        {/* Tutorial button */}
        <button
          className="w-full py-3 rounded-xl text-sm font-semibold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 text-foreground"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Eye className="w-4 h-4" /> Ver tutorial
        </button>

        {/* Sair button */}
        <button
          className="w-full py-3 rounded-xl text-sm font-semibold uppercase tracking-widest text-primary transition-all duration-300"
          style={{
            background: "rgba(180, 0, 255, 0.06)",
            border: "1px solid rgba(180, 0, 255, 0.15)",
          }}
        >
          Sair
        </button>
      </motion.div>
    </div>
  );
};

const Step = ({ num, bold, children }: { num: string; bold: string; children?: React.ReactNode }) => (
  <div className="text-sm text-foreground/80">
    <span className="font-bold text-foreground">{num} PASSO: </span>
    <span className="font-bold uppercase">{bold}</span>
    {children && <div className="mt-1">{children}</div>}
  </div>
);

const CredentialRow = ({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) => (
  <div className="flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.04)" }}>
    <span className="text-sm text-muted-foreground">
      <strong className="text-foreground">{label}:</strong> {value}
    </span>
    <button
      onClick={onCopy}
      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-foreground transition-all duration-200 hover:bg-primary/20"
      style={{ background: "rgba(255,255,255,0.08)" }}
    >
      <Copy className="w-3.5 h-3.5 inline mr-1" />
      Copiar
    </button>
  </div>
);

export default Cod;
