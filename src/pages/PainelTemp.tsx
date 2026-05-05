import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wrench, Clock, Shield, ChevronRight, AlertTriangle, ArrowUpCircle, MessageCircle, LogOut } from "lucide-react";
import NeuralBackground from "@/components/sales/NeuralBackground";
import ratariaLogo from "@/assets/rataria-logo-full.png";
import PlansPopup from "@/components/painel/PlansPopup";
import { getSubscriptionFromStorage, getActiveSubscription, isTemporarySubscription } from "@/lib/isTemporarySub";

function formatTime(ms: number) {
  if (ms <= 0) return "00:00";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function PainelTemp() {
  const navigate = useNavigate();
  const [showPlans, setShowPlans] = useState(false);
  const [now, setNow] = useState(Date.now());

  const subData = useMemo(() => getSubscriptionFromStorage(), []);
  const activeSub = useMemo(() => getActiveSubscription(subData), [subData]);
  const userName = subData?.name?.split(" ")[0] || "Usuário";

  // Redirect non-temp users back to standard panel
  useEffect(() => {
    if (!subData) {
      navigate("/usuario", { replace: true });
      return;
    }
    if (!isTemporarySubscription(activeSub)) {
      navigate("/painel", { replace: true });
    }
  }, [subData, activeSub, navigate]);

  // Tick every second for countdown
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const expiresMs = activeSub?.expiresAt ? new Date(activeSub.expiresAt).getTime() : 0;
  const remaining = expiresMs - now;

  // Auto-logout on expiration
  useEffect(() => {
    if (expiresMs && remaining <= 0) {
      localStorage.removeItem("naut_subscription");
      navigate("/usuario", { replace: true });
    }
  }, [expiresMs, remaining, navigate]);

  const lowTime = remaining > 0 && remaining < 5 * 60 * 1000; // last 5 minutes warning

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <NeuralBackground />

      <div className="relative z-10 flex-1 flex flex-col items-center px-5 md:px-8 pt-12 md:pt-16 pb-16 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md md:max-w-xl space-y-6"
        >
          {/* Logo */}
          <div className="flex justify-center">
            <img src={ratariaLogo} alt="ratarIA" className="h-20 md:h-24 w-auto" style={{ filter: "brightness(1.15)" }} />
          </div>

          {/* Temporary badge */}
          <div className="flex justify-center">
            <span
              className="px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider"
              style={{
                background: "rgba(245, 158, 11, 0.12)",
                color: "rgba(252, 211, 77, 0.95)",
                border: "1px solid rgba(245, 158, 11, 0.35)",
              }}
            >
              Acesso Temporário · 30 min
            </span>
          </div>

          {/* Greeting */}
          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: "rgba(255,255,255,0.95)" }}>
              Seja bem-vindo(a), {userName}
            </h1>
            <p className="text-xs md:text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              Você tem tempo limitado para testar nossas ferramentas
            </p>
          </div>

          {/* Countdown card */}
          <motion.div
            className="rounded-2xl px-5 py-5 md:py-6 flex items-center gap-4"
            style={{
              background: lowTime
                ? "rgba(239, 68, 68, 0.08)"
                : "rgba(59, 130, 246, 0.08)",
              border: `1px solid ${lowTime ? "rgba(239, 68, 68, 0.3)" : "rgba(59, 130, 246, 0.2)"}`,
              backdropFilter: "blur(20px)",
            }}
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: lowTime ? "rgba(239, 68, 68, 0.15)" : "rgba(59, 130, 246, 0.15)" }}
            >
              <Clock className="w-7 h-7" style={{ color: lowTime ? "rgba(248, 113, 113, 0.95)" : "rgba(96, 165, 250, 0.95)" }} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] md:text-xs uppercase tracking-wider font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
                Tempo restante
              </p>
              <p className="text-2xl md:text-3xl font-bold tabular-nums" style={{ color: lowTime ? "rgba(248, 113, 113, 0.95)" : "rgba(96, 165, 250, 0.95)" }}>
                {formatTime(Math.max(0, remaining))}
              </p>
            </div>
            <Shield className="w-5 h-5" style={{ color: "rgba(255,255,255,0.3)" }} />
          </motion.div>

          {/* Access tools - única ação principal */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/ferramentas-temp")}
            className="relative w-full flex items-center gap-4 rounded-2xl px-5 py-5 md:py-6 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))",
              boxShadow: "0 0 24px rgba(139, 92, 246, 0.3), 0 0 48px rgba(139, 92, 246, 0.12)",
            }}
          >
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                padding: "1.5px",
                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.85), rgba(168, 85, 247, 0.45), rgba(139, 92, 246, 0.85))",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
                pointerEvents: "none",
              }}
            />
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(139, 92, 246, 0.18)" }}>
              <Wrench className="w-7 h-7" style={{ color: "rgba(167, 139, 250, 0.95)" }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-base md:text-lg font-bold" style={{ color: "rgba(196, 181, 253, 0.98)" }}>
                Acessar Ferramentas
              </p>
              <p className="text-[12px] md:text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                Use as ferramentas de IA durante seu acesso
              </p>
            </div>
            <ChevronRight className="w-5 h-5" style={{ color: "rgba(167, 139, 250, 0.7)" }} />
          </motion.button>

          {/* Upgrade CTA */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowPlans(true)}
            className="w-full flex items-center gap-4 rounded-2xl px-5 py-4"
            style={{
              background: "linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(249, 115, 22, 0.04))",
              border: "1px solid rgba(249, 115, 22, 0.25)",
            }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(249, 115, 22, 0.15)" }}>
              <ArrowUpCircle className="w-6 h-6" style={{ color: "rgba(251, 146, 60, 0.95)" }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm md:text-base font-bold" style={{ color: "rgba(251, 146, 60, 0.95)" }}>
                Assinar um plano
              </p>
              <p className="text-[11px] md:text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                Tenha acesso ilimitado a todas as ferramentas
              </p>
            </div>
            <ChevronRight className="w-5 h-5" style={{ color: "rgba(251, 146, 60, 0.5)" }} />
          </motion.button>

          {/* Suporte */}
          <motion.a
            href="https://wa.me/5511922926559?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20meu%20acesso%20tempor%C3%A1rio!"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="block w-full rounded-2xl px-5 py-4"
            style={{
              background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.03))",
              border: "1px solid rgba(34, 197, 94, 0.2)",
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(34, 197, 94, 0.15)" }}>
                <MessageCircle className="w-6 h-6" style={{ color: "rgba(74, 222, 128, 0.9)" }} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm md:text-base font-bold" style={{ color: "rgba(74, 222, 128, 0.95)" }}>Fale conosco</p>
                <p className="text-[11px] md:text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>Tire dúvidas via WhatsApp</p>
              </div>
              <ChevronRight className="w-5 h-5" style={{ color: "rgba(74, 222, 128, 0.5)" }} />
            </div>
          </motion.a>

          {/* Aviso */}
          <div
            className="flex items-start gap-3 rounded-xl px-4 py-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "rgba(252, 211, 77, 0.8)" }} />
            <p className="text-[11px] md:text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
              Após os 30 minutos, seu acesso será encerrado automaticamente. Para continuar utilizando, assine um plano.
            </p>
          </div>

          {/* Logout */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              localStorage.removeItem("naut_subscription");
              navigate("/usuario", { replace: true });
            }}
            className="w-full flex items-center justify-center gap-2 rounded-2xl px-5 py-3"
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              color: "rgba(248, 113, 113, 0.95)",
            }}
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-semibold">Sair</span>
          </motion.button>
        </motion.div>
      </div>

      <PlansPopup open={showPlans} onClose={() => setShowPlans(false)} />
    </div>
  );
}
