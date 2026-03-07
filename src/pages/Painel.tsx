import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wrench, User, Power, MessageCircle, GraduationCap, AlertTriangle, Clock, Shield } from "lucide-react";
import NeuralBackground from "@/components/sales/NeuralBackground";
import ratariaLogo from "@/assets/rataria-logo-full.png";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
};

const phrases = [
  "Foque no progresso, não na perfeição.",
  "Cada passo conta na sua jornada.",
  "A consistência vence o talento.",
  "Hoje é o melhor dia para evoluir.",
];

export default function Painel() {
  const navigate = useNavigate();
  const [userName] = useState("Usuário");
  const [phrase] = useState(() => phrases[Math.floor(Math.random() * phrases.length)]);
  const [subscriptionExpired] = useState(true);

  const menuCards = [
    { icon: Wrench, label: "Acessar\nferramentas", id: "ferramentas" },
    { icon: User, label: "Configurações\nde usuário", id: "config" },
  ];

  const quickStats = [
    { icon: Clock, label: "Dias restantes", value: "28", color: "0, 200, 120" },
    { icon: Shield, label: "Status", value: "Ativo", color: "100, 180, 255" },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <NeuralBackground />
      <div className="fixed inset-0 z-[1] pointer-events-none" style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(180, 0, 255, 0.03) 0%, transparent 60%)"
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-lg mx-4 space-y-5"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="flex justify-center"
        >
          <img src={ratariaLogo} alt="ratarIA" className="h-14 w-auto" style={{ filter: "brightness(1.1)" }} />
        </motion.div>

        {/* Greeting Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl px-6 py-5 text-center mx-auto max-w-sm"
          style={{
            background: "rgba(40, 100, 220, 0.15)",
            border: "1px solid rgba(40, 100, 220, 0.25)",
            backdropFilter: "blur(30px)",
          }}
        >
          <h1 className="text-lg font-bold tracking-tight" style={{ color: "rgba(255,255,255,0.95)" }}>
            {getGreeting()}, {userName} 👋
          </h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
            {phrase}
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3 max-w-sm mx-auto"
        >
          {quickStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.08 }}
              whileHover={{ scale: 1.03, y: -1 }}
              className="flex flex-col items-center gap-1.5 py-3 px-3 rounded-xl cursor-default"
              style={{
                background: `rgba(${stat.color}, 0.06)`,
                border: `1px solid rgba(${stat.color}, 0.12)`,
              }}
            >
              <stat.icon className="w-3.5 h-3.5" style={{ color: `rgba(${stat.color}, 0.7)` }} />
              <span className="text-base font-bold" style={{ color: `rgba(${stat.color}, 0.9)` }}>{stat.value}</span>
              <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.25)" }}>{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Subscription Warning */}
        {subscriptionExpired && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28 }}
            className="flex items-center justify-center gap-3"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: "rgba(255, 200, 50, 0.8)" }} />
              <span className="text-xs font-medium" style={{ color: "rgba(255, 200, 50, 0.8)" }}>Sua assinatura expirou.</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider"
              style={{ background: "rgba(40, 100, 220, 0.9)", color: "#fff" }}
            >
              Renovar agora
            </motion.button>
          </motion.div>
        )}

        {/* Action Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="grid grid-cols-2 gap-3"
        >
          {menuCards.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.08 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {}}
              className="flex flex-col items-center justify-center gap-3 py-7 px-4 rounded-2xl transition-all duration-300"
              style={{
                background: "rgba(40, 100, 220, 0.12)",
                border: "1px solid rgba(40, 100, 220, 0.2)",
                backdropFilter: "blur(20px)",
              }}
            >
              <item.icon className="w-7 h-7" style={{ color: "rgba(255,255,255,0.85)" }} />
              <span className="text-xs font-semibold text-center leading-tight whitespace-pre-line" style={{ color: "rgba(255,255,255,0.85)" }}>
                {item.label}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl px-5 py-4"
          style={{
            background: "rgba(10, 10, 10, 0.6)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(30px)",
          }}
        >
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
            Olá, <strong style={{ color: "rgba(255,255,255,0.8)" }}>{userName}</strong> (não é {userName}?{" "}
            <span className="underline cursor-pointer" style={{ color: "rgba(100, 160, 255, 0.8)" }}>Sair</span>)
          </p>
          <p className="text-[11px] mt-2 leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
            A partir do painel de controle, você pode ver suas{" "}
            <span className="underline cursor-pointer" style={{ color: "rgba(100, 160, 255, 0.7)" }}>compras recentes</span>, gerenciar seus{" "}
            <span className="underline cursor-pointer" style={{ color: "rgba(100, 160, 255, 0.7)" }}>endereços de entrega e cobrança</span>, e{" "}
            <span className="underline cursor-pointer" style={{ color: "rgba(100, 160, 255, 0.7)" }}>editar sua senha e detalhes da conta</span>.
          </p>
        </motion.div>

        {/* Bottom Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="flex flex-col items-center justify-center gap-2 py-5 rounded-2xl transition-all duration-300"
            style={{
              background: "rgba(0, 180, 70, 0.15)",
              border: "1px solid rgba(0, 180, 70, 0.25)",
            }}
          >
            <MessageCircle className="w-6 h-6" style={{ color: "rgba(255,255,255,0.9)" }} />
            <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>Fale conosco</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="flex flex-col items-center justify-center gap-2 py-5 rounded-2xl transition-all duration-300"
            style={{
              background: "rgba(40, 80, 180, 0.15)",
              border: "1px solid rgba(40, 80, 180, 0.25)",
            }}
          >
            <GraduationCap className="w-6 h-6" style={{ color: "rgba(255,255,255,0.9)" }} />
            <span className="text-xs font-semibold text-center leading-tight" style={{ color: "rgba(255,255,255,0.9)" }}>eBook Monetizando<br />com IA</span>
          </motion.button>
        </motion.div>

        {/* Logout Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center pt-2 pb-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/usuario")}
            className="flex flex-col items-center gap-1.5 px-6 py-3 rounded-xl transition-all duration-300"
            style={{
              background: "rgba(255, 80, 80, 0.06)",
              border: "1px solid rgba(255, 80, 80, 0.12)",
            }}
          >
            <Power className="w-5 h-5" style={{ color: "rgba(255, 100, 100, 0.7)" }} />
            <span className="text-[11px] font-medium" style={{ color: "rgba(255, 100, 100, 0.6)" }}>Deslogar</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
