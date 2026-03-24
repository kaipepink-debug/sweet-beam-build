import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, User, Power, MessageCircle, GraduationCap, Clock, Shield, ChevronRight, Sparkles, Lock } from "lucide-react";
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

const darkTheme = {
  greeting: "rgba(255,255,255,0.95)",
  phrase: "rgba(255,255,255,0.4)",
  statLabel: "rgba(255,255,255,0.3)",
  tabBg: "rgba(255,255,255,0.04)",
  tabInactive: "rgba(255,255,255,0.3)",
  cardBg: "rgba(255,255,255,0.03)",
  cardBorder: "rgba(255,255,255,0.06)",
  menuLabel: "rgba(255,255,255,0.85)",
  menuDesc: "rgba(255,255,255,0.3)",
  chevron: "rgba(255,255,255,0.15)",
  chevronHover: "rgba(255,255,255,0.4)",
  infoTitle: "rgba(255,255,255,0.8)",
  infoText: "rgba(255,255,255,0.4)",
  infoStrong: "rgba(255,255,255,0.7)",
  bottomGradient: "rgba(0,0,0,0.9)",
  logoutColor: "rgba(255,255,255,0.3)",
  toggleBg: "rgba(255,255,255,0.08)",
  toggleBorder: "rgba(255,255,255,0.08)",
  toggleIcon: "rgba(255,255,255,0.6)",
  logoFilter: "brightness(1.15)",
};

export default function Painel() {
  const navigate = useNavigate();
  const [phrase] = useState(() => phrases[Math.floor(Math.random() * phrases.length)]);
  const [activeTab, setActiveTab] = useState<"menu" | "info">("menu");

  const t = darkTheme;

  // Pull subscription data from localStorage
  const subData = useMemo(() => {
    try {
      const raw = localStorage.getItem("naut_subscription");
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }, []);

  const userName = subData?.name?.split(" ")[0] || "Usuário";

  const activeSub = useMemo(() => {
    if (!subData?.subscriptions?.length) return null;
    return subData.subscriptions.find((s: any) => s.isActive) || subData.subscriptions[0];
  }, [subData]);

  const daysRemaining = useMemo(() => {
    if (!activeSub?.expiresAt) return "—";
    const diff = Math.ceil((new Date(activeSub.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? String(diff) : "0";
  }, [activeSub]);

  const statusText = useMemo(() => {
    if (!activeSub) return "Inativo";
    const diff = new Date(activeSub.expiresAt).getTime() - Date.now();
    return diff > 0 ? "Ativo" : "Expirado";
  }, [activeSub]);

  const statusColor = statusText === "Ativo" ? "34, 197, 94" : "239, 68, 68";

  const menuItems = [
    { icon: Wrench, label: "Ferramentas IA", desc: "Acesse todas as ferramentas", id: "ferramentas", color: "139, 92, 246", locked: false },
    { icon: User, label: "Minha conta", desc: "Em breve", id: "config", color: "59, 130, 246", locked: true },
    { icon: GraduationCap, label: "eBook Monetizando com IA", desc: "Em breve", id: "ebook", color: "16, 185, 129", locked: true },
    { icon: MessageCircle, label: "Fale conosco", desc: "Em breve", id: "suporte", color: "34, 197, 94", locked: true },
  ];

  const stats = [
    { icon: Clock, label: "Dias restantes", value: daysRemaining, color: "59, 130, 246" },
    { icon: Shield, label: "Status", value: statusText, color: statusColor },
  ];

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <NeuralBackground variant="dark-gray" />

      {/* Scrollable content */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-5 md:px-8 pt-12 md:pt-16 pb-28 overflow-y-auto">
        <motion.div
          initial="initial"
          animate="animate"
          variants={stagger.container}
          className="w-full max-w-md md:max-w-2xl space-y-5 md:space-y-7"
        >
          {/* Logo */}
          <motion.div variants={stagger.item} className="flex justify-center">
            <img src={ratariaLogo} alt="ratarIA" className="h-20 md:h-28 w-auto transition-all duration-500" style={{ filter: t.logoFilter }} />
          </motion.div>

          {/* Greeting */}
          <motion.div variants={stagger.item} className="text-center">
             <h1 className="text-xl md:text-2xl font-bold tracking-tight transition-colors duration-500" style={{ color: t.greeting }}>
              {getGreeting()}, {userName}
            </h1>
            <p className="text-xs md:text-sm mt-1 italic transition-colors duration-500" style={{ color: t.phrase }}>{phrase}</p>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={stagger.item} className="flex gap-3 md:gap-4">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center gap-3 md:gap-4 rounded-2xl px-4 md:px-5 py-3.5 md:py-5"
                style={{
                  background: `rgba(${stat.color}, 0.08)`,
                  border: `1px solid rgba(${stat.color}, 0.15)`,
                  backdropFilter: "blur(20px)",
                }}
              >
                <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl flex items-center justify-center" style={{ background: `rgba(${stat.color}, 0.12)` }}>
                  <stat.icon className="w-6 h-6 md:w-7 md:h-7" style={{ color: `rgba(${stat.color}, 0.85)` }} />
                </div>
                <div>
                  <p className="text-sm md:text-base font-bold" style={{ color: `rgba(${stat.color}, 0.95)` }}>{stat.value}</p>
                  <p className="text-[10px] md:text-xs uppercase tracking-wider font-medium transition-colors duration-500" style={{ color: t.statLabel }}>{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Tab switcher */}
          <motion.div variants={stagger.item} className="flex gap-1 p-1 rounded-xl transition-colors duration-500" style={{ background: t.tabBg }}>
            {(["menu", "info"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold uppercase tracking-wider transition-all duration-300"
                style={{
                  background: activeTab === tab ? "rgba(139, 92, 246, 0.12)" : "transparent",
                  color: activeTab === tab ? "rgba(139, 92, 246, 0.9)" : t.tabInactive,
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
                    whileHover={!item.locked ? { x: 4 } : {}}
                    whileTap={!item.locked ? { scale: 0.98 } : {}}
                    className={`w-full flex items-center gap-4 rounded-2xl px-4 md:px-5 py-4 md:py-5 group transition-all duration-200 ${item.locked ? "cursor-not-allowed" : ""}`}
                    style={{
                      background: t.cardBg,
                      border: `1px solid ${t.cardBorder}`,
                      opacity: item.locked ? 0.45 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!item.locked) {
                        e.currentTarget.style.background = `rgba(${item.color}, 0.08)`;
                        e.currentTarget.style.borderColor = `rgba(${item.color}, 0.15)`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = t.cardBg;
                      e.currentTarget.style.borderColor = t.cardBorder;
                    }}
                    onClick={() => {
                      if (!item.locked && item.id === "ferramentas") navigate("/ferramentas");
                    }}
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200" style={{ background: `rgba(${item.color}, 0.1)` }}>
                      <item.icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: `rgba(${item.color}, 0.8)` }} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm md:text-base font-semibold transition-colors duration-500" style={{ color: t.menuLabel }}>{item.label}</p>
                      <p className="text-[11px] md:text-sm transition-colors duration-500" style={{ color: t.menuDesc }}>{item.desc}</p>
                    </div>
                    {item.locked ? (
                      <Lock className="w-4 h-4" style={{ color: t.chevron }} />
                    ) : (
                      <ChevronRight className="w-4 h-4" style={{ color: t.chevron }} />
                    )}
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
                className="rounded-2xl px-5 md:px-7 py-5 md:py-6 space-y-4"
                style={{
                  background: t.cardBg,
                  border: `1px solid ${t.cardBorder}`,
                  backdropFilter: "blur(30px)",
                }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" style={{ color: "rgba(139, 92, 246, 0.7)" }} />
                  <h3 className="text-sm md:text-base font-bold transition-colors duration-500" style={{ color: t.infoTitle }}>Área do Cliente</h3>
                </div>
                <p className="text-xs md:text-sm leading-relaxed transition-colors duration-500" style={{ color: t.infoText }}>
                  Olá, <strong style={{ color: t.infoStrong }}>{userName}</strong>. A partir deste painel você pode gerenciar suas ferramentas, acompanhar sua assinatura e acessar materiais exclusivos.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Compras recentes", "Endereços", "Senha e conta"].map((link) => (
                    <button
                      key={link}
                      className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[11px] md:text-xs font-medium transition-colors duration-200"
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
        style={{ background: `linear-gradient(to top, ${t.bottomGradient} 40%, transparent)` }}
      >
        <motion.button
          whileHover={{ scale: 1.08, opacity: 0.8 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate("/usuario")}
          className="flex flex-col items-center gap-1 px-6 py-2"
        >
          <Power className="w-5 h-5 transition-colors duration-500" style={{ color: t.logoutColor }} />
          <span className="text-[10px] font-medium transition-colors duration-500" style={{ color: t.logoutColor }}>Deslogar</span>
        </motion.button>
      </motion.div>
    </div>
  );
}
