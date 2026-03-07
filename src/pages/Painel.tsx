import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wrench, User, Power, MessageCircle, GraduationCap, AlertTriangle } from "lucide-react";
import NeuralBackground from "@/components/sales/NeuralBackground";
import ratariaLogo from "@/assets/rataria-logo-full.png";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
};

const motivationalPhrases = [
  "Foque no progresso, não na perfeição.",
  "Cada passo conta na sua jornada.",
  "A consistência vence o talento.",
  "Hoje é o melhor dia para evoluir.",
  "Sua dedicação é o diferencial.",
];

export default function Painel() {
  const navigate = useNavigate();
  const [userName] = useState("Usuário"); // será substituído pela API
  const [phrase] = useState(() => motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)]);
  const [subscriptionExpired] = useState(false); // será controlado pela API

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <NeuralBackground />

      <div className="fixed inset-0 z-[1] pointer-events-none" style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(180, 0, 255, 0.04) 0%, transparent 60%)"
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-2xl mx-4 space-y-5"
      >
        {/* Greeting Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-6 text-center"
          style={{
            background: "rgba(10, 10, 10, 0.8)",
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 0 40px rgba(0,0,0,0.3)",
          }}
        >
          <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-1" style={{ color: "rgba(255,255,255,0.9)" }}>
            {getGreeting()}, {userName}
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>{phrase}</p>
        </motion.div>

        {/* Subscription Warning */}
        {subscriptionExpired && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between rounded-xl px-5 py-3"
            style={{
              background: "rgba(255, 180, 0, 0.08)",
              border: "1px solid rgba(255, 180, 0, 0.2)",
            }}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" style={{ color: "rgba(255, 200, 50, 0.9)" }} />
              <span className="text-sm font-medium" style={{ color: "rgba(255, 200, 50, 0.9)" }}>Sua assinatura expirou.</span>
            </div>
            <button
              className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all hover:scale-105"
              style={{
                background: "rgba(255, 200, 50, 0.9)",
                color: "#000",
              }}
            >
              Renovar Agora
            </button>
          </motion.div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Wrench, label: "Acessar\nferramentas", id: "ferramentas" },
            { icon: User, label: "Configurações\nde usuário", id: "config" },
            { icon: Power, label: "Deslogar", id: "logout" },
          ].map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.1 }}
              onClick={() => {
                if (item.id === "logout") navigate("/usuario");
              }}
              className="neon-border-btn relative flex flex-col items-center justify-center gap-3 p-6 md:p-8 rounded-2xl transition-all duration-300 hover:scale-[1.03] overflow-hidden"
              style={{
                background: "rgba(10, 10, 10, 0.8)",
                backdropFilter: "blur(40px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <span className="neon-trail" style={{ borderRadius: "1rem" }} />
              <item.icon className="relative z-10 w-7 h-7" style={{ color: "rgba(200, 120, 255, 0.9)" }} />
              <span className="relative z-10 text-xs font-bold uppercase tracking-wider text-center whitespace-pre-line leading-tight" style={{ color: "rgba(255,255,255,0.85)" }}>
                {item.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl p-6"
          style={{
            background: "rgba(10, 10, 10, 0.8)",
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
            Olá, <span className="font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>{userName}</span>{" "}
            <span style={{ color: "rgba(255,255,255,0.3)" }}>(não é {userName}? <button onClick={() => navigate("/usuario")} className="underline" style={{ color: "rgba(200, 120, 255, 0.7)" }}>Sair</button>)</span>
          </p>
          <p className="text-sm mt-2 leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
            A partir do painel de controle da sua conta, você pode acessar suas{" "}
            <span className="font-semibold" style={{ color: "rgba(200, 120, 255, 0.7)" }}>ferramentas de IA</span>, gerenciar suas{" "}
            <span className="font-semibold" style={{ color: "rgba(200, 120, 255, 0.7)" }}>configurações de conta</span>, e editar seus{" "}
            <span className="font-semibold" style={{ color: "rgba(200, 120, 255, 0.7)" }}>dados pessoais</span>.
          </p>
        </motion.div>

        {/* Bottom Actions */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: MessageCircle, label: "Fale conosco", color: "rgba(0, 200, 80, 0.9)", bg: "rgba(0, 200, 80, 0.12)", border: "rgba(0, 200, 80, 0.25)" },
            { icon: GraduationCap, label: "eBook Monetizando com IA", color: "rgba(100, 140, 255, 0.9)", bg: "rgba(100, 140, 255, 0.12)", border: "rgba(100, 140, 255, 0.25)" },
          ].map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 + i * 0.1 }}
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl transition-all duration-300 hover:scale-[1.03]"
              style={{
                background: item.bg,
                border: `1px solid ${item.border}`,
              }}
            >
              <item.icon className="w-7 h-7" style={{ color: item.color }} />
              <span className="text-xs font-bold uppercase tracking-wider text-center" style={{ color: item.color }}>
                {item.label}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
