import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, User, Power, MessageCircle, GraduationCap, Clock, Shield, ChevronRight, Sparkles } from "lucide-react";
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

const stagger = {
  container: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
  item: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function Painel() {
  const navigate = useNavigate();
  const [userName] = useState("Usuário");
  const [phrase] = useState(() => phrases[Math.floor(Math.random() * phrases.length)]);
  const [activeTab, setActiveTab] = useState<"menu" | "info">("menu");

  const menuItems = [
    { icon: Wrench, label: "Ferramentas IA", desc: "Acesse todas as ferramentas", id: "ferramentas", color: "139, 92, 246" },
    { icon: User, label: "Minha conta", desc: "Configurações e perfil", id: "config", color: "59, 130, 246" },
    { icon: GraduationCap, label: "eBook Monetizando com IA", desc: "Material exclusivo", id: "ebook", color: "16, 185, 129" },
    { icon: MessageCircle, label: "Fale conosco", desc: "Suporte via WhatsApp", id: "suporte", color: "34, 197, 94" },
  ];

  const stats = [
    { icon: Clock, label: "Dias restantes", value: "28", color: "16, 185, 129" },
    { icon: Shield, label: "Status", value: "Ativo", color: "59, 130, 246" },
  ];

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <NeuralBackground />

      {/* Scrollable content */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-5 pt-12 pb-28 overflow-y-auto">
        <motion.div
          initial="initial"
          animate="animate"
          variants={stagger.container}
          className="w-full max-w-md space-y-5"
        >
          {/* Logo */}
          <motion.div variants={stagger.item} className="flex justify-center">
            <img src={ratariaLogo} alt="ratarIA" className="h-10 w-auto" style={{ filter: "brightness(1.15)" }} />
          </motion.div>

          {/* Greeting */}
          <motion.div variants={stagger.item} className="text-center">
            <h1 className="text-xl font-bold tracking-tight text-white/95">
              {getGreeting()}, {userName}
            </h1>
            <p className="text-xs mt-1 text-white/40 italic">{phrase}</p>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={stagger.item} className="flex gap-3">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center gap-3 rounded-2xl px-4 py-3.5"
                style={{
                  background: `rgba(${stat.color}, 0.08)`,
                  border: `1px solid rgba(${stat.color}, 0.15)`,
                  backdropFilter: "blur(20px)",
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `rgba(${stat.color}, 0.12)` }}>
                  <stat.icon className="w-4 h-4" style={{ color: `rgba(${stat.color}, 0.85)` }} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: `rgba(${stat.color}, 0.95)` }}>{stat.value}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Tab switcher */}
          <motion.div variants={stagger.item} className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
            {(["menu", "info"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300"
                style={{
                  background: activeTab === tab ? "rgba(139, 92, 246, 0.15)" : "transparent",
                  color: activeTab === tab ? "rgba(139, 92, 246, 0.9)" : "rgba(255,255,255,0.3)",
                  border: activeTab === tab ? "1px solid rgba(139, 92, 246, 0.2)" : "1px solid transparent",
                }}
              >
                {tab === "menu" ? "Menu" : "Informações"}
              </button>
            ))}
          </motion.div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            {activeTab === "menu" ? (
              <motion.div
                key="menu"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                {menuItems.map((item, i) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 24 }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-4 rounded-2xl px-4 py-4 group transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `rgba(${item.color}, 0.08)`;
                      e.currentTarget.style.borderColor = `rgba(${item.color}, 0.15)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200" style={{ background: `rgba(${item.color}, 0.1)` }}>
                      <item.icon className="w-5 h-5" style={{ color: `rgba(${item.color}, 0.8)` }} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-white/85">{item.label}</p>
                      <p className="text-[11px] text-white/30">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/15 group-hover:text-white/40 transition-colors" />
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl px-5 py-5 space-y-4"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(30px)",
                }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" style={{ color: "rgba(139, 92, 246, 0.7)" }} />
                  <h3 className="text-sm font-bold text-white/80">Área do Cliente</h3>
                </div>
                <p className="text-xs leading-relaxed text-white/40">
                  Olá, <strong className="text-white/70">{userName}</strong>. A partir deste painel você pode gerenciar suas ferramentas, acompanhar sua assinatura e acessar materiais exclusivos.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Compras recentes", "Endereços", "Senha e conta"].map((link) => (
                    <button
                      key={link}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors duration-200"
                      style={{
                        background: "rgba(139, 92, 246, 0.08)",
                        border: "1px solid rgba(139, 92, 246, 0.12)",
                        color: "rgba(139, 92, 246, 0.7)",
                      }}
                    >
                      {link}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Fixed bottom bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
        className="fixed bottom-0 left-0 right-0 z-20 flex justify-center pb-6 pt-10"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 40%, transparent)" }}
      >
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate("/usuario")}
          className="flex flex-col items-center gap-1 px-8 py-3 rounded-2xl transition-all duration-300"
          style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.15)",
          }}
        >
          <Power className="w-5 h-5" style={{ color: "rgba(239, 68, 68, 0.7)" }} />
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgba(239, 68, 68, 0.6)" }}>Deslogar</span>
        </motion.button>
      </motion.div>
    </div>
  );
}
