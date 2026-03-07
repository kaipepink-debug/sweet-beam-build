import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wrench, User, Power, MessageCircle, GraduationCap, AlertTriangle, ChevronRight } from "lucide-react";
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
  const [subscriptionExpired] = useState(false);

  const menuItems = [
    { icon: Wrench, label: "Acessar ferramentas", id: "ferramentas" },
    { icon: User, label: "Configurações de usuário", id: "config" },
    { icon: Power, label: "Deslogar", id: "logout" },
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
        className="relative z-10 w-full max-w-md mx-4 space-y-4"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center"
        >
          <img src={ratariaLogo} alt="ratarIA" className="h-14 w-auto" style={{ filter: "brightness(1.1)" }} />
        </motion.div>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center pt-2"
        >
          <h1 className="text-lg font-bold tracking-tight" style={{ color: "rgba(255,255,255,0.9)" }}>
            {getGreeting()}, {userName}
          </h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{phrase}</p>
        </motion.div>

        {/* Subscription Warning */}
        {subscriptionExpired && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex items-center justify-between rounded-xl px-4 py-2.5"
            style={{
              background: "rgba(255, 180, 0, 0.06)",
              border: "1px solid rgba(255, 180, 0, 0.15)",
            }}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: "rgba(255, 200, 50, 0.8)" }} />
              <span className="text-xs font-medium" style={{ color: "rgba(255, 200, 50, 0.8)" }}>Assinatura expirada</span>
            </div>
            <button className="px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider" style={{ background: "rgba(255, 200, 50, 0.85)", color: "#000" }}>
              Renovar
            </button>
          </motion.div>
        )}

        {/* Menu List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(10, 10, 10, 0.7)",
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          {menuItems.map((item, i) => (
            <button
              key={item.id}
              onClick={() => { if (item.id === "logout") navigate("/usuario"); }}
              className="w-full flex items-center gap-4 px-5 py-4 transition-all duration-300 hover:bg-white/[0.03] group"
              style={{
                borderBottom: i < menuItems.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300" style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <item.icon className="w-4 h-4 transition-colors duration-300" style={{ color: item.id === "logout" ? "rgba(255,100,100,0.6)" : "rgba(200, 120, 255, 0.7)" }} />
              </div>
              <span className="flex-1 text-left text-sm font-medium" style={{ color: item.id === "logout" ? "rgba(255,100,100,0.7)" : "rgba(255,255,255,0.7)" }}>
                {item.label}
              </span>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: "rgba(255,255,255,0.2)" }} />
            </button>
          ))}
        </motion.div>

        {/* Info Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-center leading-relaxed px-2"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          Gerencie suas ferramentas, configurações e conta a partir deste painel.
        </motion.p>

        {/* Bottom Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-3"
        >
          <button className="flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02]" style={{
            background: "rgba(0, 200, 80, 0.08)",
            border: "1px solid rgba(0, 200, 80, 0.15)",
          }}>
            <MessageCircle className="w-4 h-4" style={{ color: "rgba(0, 200, 80, 0.7)" }} />
            <span className="text-xs font-semibold" style={{ color: "rgba(0, 200, 80, 0.7)" }}>Fale conosco</span>
          </button>
          <button className="flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02]" style={{
            background: "rgba(100, 140, 255, 0.08)",
            border: "1px solid rgba(100, 140, 255, 0.15)",
          }}>
            <GraduationCap className="w-4 h-4" style={{ color: "rgba(100, 140, 255, 0.7)" }} />
            <span className="text-xs font-semibold" style={{ color: "rgba(100, 140, 255, 0.7)" }}>eBook IA</span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
