import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, User, Power, MessageCircle, GraduationCap, AlertTriangle, ChevronRight, Sparkles, Clock, Shield } from "lucide-react";
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
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [pressedItem, setPressedItem] = useState<string | null>(null);

  const menuItems = [
    { icon: Wrench, label: "Acessar ferramentas", id: "ferramentas", description: "Explore todas as IAs disponíveis", accent: "180, 120, 255" },
    { icon: User, label: "Configurações de usuário", id: "config", description: "Gerencie seu perfil e preferências", accent: "120, 180, 255" },
    { icon: Power, label: "Deslogar", id: "logout", description: "Encerrar sessão atual", accent: "255, 100, 100" },
  ];

  const quickStats = [
    { icon: Sparkles, label: "Ferramentas", value: "17", color: "180, 0, 255" },
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
        className="relative z-10 w-full max-w-md mx-4 space-y-5"
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

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center pt-1"
        >
          <h1 className="text-lg font-bold tracking-tight" style={{ color: "rgba(255,255,255,0.9)" }}>
            {getGreeting()}, {userName}
          </h1>
          <motion.p
            key={phrase}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs mt-1 italic"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            "{phrase}"
          </motion.p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-3 gap-2"
        >
          {quickStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl cursor-default transition-all duration-300"
              style={{
                background: `rgba(${stat.color}, 0.04)`,
                border: `1px solid rgba(${stat.color}, 0.08)`,
              }}
            >
              <stat.icon className="w-3.5 h-3.5" style={{ color: `rgba(${stat.color}, 0.6)` }} />
              <span className="text-base font-bold" style={{ color: `rgba(${stat.color}, 0.85)` }}>{stat.value}</span>
              <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.25)" }}>{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Subscription Warning */}
        <AnimatePresence>
          {subscriptionExpired && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
                style={{ background: "rgba(255, 200, 50, 0.85)", color: "#000" }}
              >
                Renovar
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(10, 10, 10, 0.7)",
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          {menuItems.map((item, i) => (
            <motion.button
              key={item.id}
              onHoverStart={() => setHoveredItem(item.id)}
              onHoverEnd={() => setHoveredItem(null)}
              onTapStart={() => setPressedItem(item.id)}
              onTap={() => {
                setPressedItem(null);
                if (item.id === "logout") navigate("/usuario");
              }}
              onTapCancel={() => setPressedItem(null)}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-4 px-5 py-4 transition-all duration-300 group relative"
              style={{
                borderBottom: i < menuItems.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                background: hoveredItem === item.id ? `rgba(${item.accent}, 0.03)` : "transparent",
              }}
            >
              {/* Active indicator */}
              <motion.div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full"
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: hoveredItem === item.id ? 24 : 0,
                  opacity: hoveredItem === item.id ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
                style={{ background: `rgba(${item.accent}, 0.7)` }}
              />

              <motion.div
                animate={{
                  scale: pressedItem === item.id ? 0.9 : 1,
                  background: hoveredItem === item.id ? `rgba(${item.accent}, 0.1)` : "rgba(255,255,255,0.04)",
                  borderColor: hoveredItem === item.id ? `rgba(${item.accent}, 0.15)` : "rgba(255,255,255,0.06)",
                }}
                transition={{ duration: 0.2 }}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <item.icon className="w-4 h-4 transition-colors duration-300" style={{ color: `rgba(${item.accent}, 0.7)` }} />
              </motion.div>

              <div className="flex-1 text-left">
                <span className="text-sm font-medium block" style={{ color: item.id === "logout" ? "rgba(255,100,100,0.7)" : "rgba(255,255,255,0.75)" }}>
                  {item.label}
                </span>
                <motion.span
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: hoveredItem === item.id ? 1 : 0,
                    height: hoveredItem === item.id ? "auto" : 0,
                  }}
                  className="text-[10px] block overflow-hidden"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {item.description}
                </motion.span>
              </div>

              <motion.div
                animate={{
                  x: hoveredItem === item.id ? 0 : -5,
                  opacity: hoveredItem === item.id ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-4 h-4" style={{ color: `rgba(${item.accent}, 0.4)` }} />
              </motion.div>
            </motion.button>
          ))}
        </motion.div>

        {/* Bottom Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden group"
            style={{
              background: "rgba(0, 200, 80, 0.06)",
              border: "1px solid rgba(0, 200, 80, 0.12)",
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
              background: "radial-gradient(circle at 50% 50%, rgba(0, 200, 80, 0.08), transparent 70%)"
            }} />
            <MessageCircle className="w-4 h-4 relative z-10" style={{ color: "rgba(0, 200, 80, 0.7)" }} />
            <span className="text-xs font-semibold relative z-10" style={{ color: "rgba(0, 200, 80, 0.7)" }}>Fale conosco</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden group"
            style={{
              background: "rgba(100, 140, 255, 0.06)",
              border: "1px solid rgba(100, 140, 255, 0.12)",
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
              background: "radial-gradient(circle at 50% 50%, rgba(100, 140, 255, 0.08), transparent 70%)"
            }} />
            <GraduationCap className="w-4 h-4 relative z-10" style={{ color: "rgba(100, 140, 255, 0.7)" }} />
            <span className="text-xs font-semibold relative z-10" style={{ color: "rgba(100, 140, 255, 0.7)" }}>eBook IA</span>
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-[10px] text-center"
          style={{ color: "rgba(255,255,255,0.15)" }}
        >
          Gerencie suas ferramentas e conta a partir deste painel.
        </motion.p>
      </motion.div>
    </div>
  );
}
