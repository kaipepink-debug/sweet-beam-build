import { useState, useMemo, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, User, Power, MessageCircle, GraduationCap, Clock, Shield, ChevronRight, Sparkles, Lock, AlertTriangle, Bell, TrendingUp, ArrowUpCircle } from "lucide-react";
import ratariaIcon from "@/assets/rataria-icon.png";
import NeuralBackground from "@/components/sales/NeuralBackground";
import ratariaLogo from "@/assets/rataria-logo-full.png";
import AccountModal from "@/components/painel/AccountModal";
import PlansPopup from "@/components/painel/PlansPopup";

const getGreeting = () => {
  const hour = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })).getHours();
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
  bottomGradient: "rgba(21,21,24,0.95)",
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
  const [showAccount, setShowAccount] = useState(false);
  const [showPlans, setShowPlans] = useState(false);

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

  // Auto-logout when subscription expires (handles 30-minute temporary logins)
  useEffect(() => {
    if (!activeSub?.expiresAt) return;
    const expiresMs = new Date(activeSub.expiresAt).getTime();
    const now = Date.now();
    const remaining = expiresMs - now;
    if (remaining <= 0) {
      localStorage.removeItem("naut_subscription");
      navigate("/usuario", { replace: true });
      return;
    }
    const timer = setTimeout(() => {
      localStorage.removeItem("naut_subscription");
      navigate("/usuario", { replace: true });
    }, remaining + 500);
    return () => clearTimeout(timer);
  }, [activeSub, navigate]);

  const statusColor = statusText === "Ativo" ? "34, 197, 94" : "239, 68, 68";
  const daysNum = parseInt(daysRemaining) || 0;
  const showRenewalAlert = daysNum > 0 && daysNum <= 5;

  const menuItems = [
    { icon: Wrench, label: "Acessar ferramentas de IA", desc: "Acesse todas as ferramentas", id: "ferramentas", color: "139, 92, 246", locked: false },
    
    { icon: GraduationCap, label: "eBook Monetizando com IA", desc: "Em breve", id: "ebook", color: "16, 185, 129", locked: true },
    { icon: MessageCircle, label: "Fale conosco", desc: "Abrir WhatsApp", id: "suporte", color: "34, 197, 94", locked: false },
  ];

  const stats = [
    { icon: Clock, label: "Dias restantes", value: daysRemaining, color: "59, 130, 246" },
    { icon: Shield, label: "Status", value: statusText, color: statusColor },
  ];

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <NeuralBackground />

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

          {/* Renewal alert */}
          {showRenewalAlert && (
            <motion.div
              variants={stagger.item}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab("info")}
              className="flex items-center gap-3 rounded-2xl px-4 md:px-5 py-3.5 md:py-4 cursor-pointer"
              style={{
                background: "rgba(239, 168, 68, 0.08)",
                border: "1px solid rgba(239, 168, 68, 0.2)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(239, 168, 68, 0.12)" }}>
                <AlertTriangle className="w-5 h-5" style={{ color: "rgba(239, 168, 68, 0.9)" }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: "rgba(239, 168, 68, 0.95)" }}>
                  Sua assinatura expira em {daysRemaining} dias
                </p>
                <p className="text-[11px]" style={{ color: "rgba(239, 168, 68, 0.5)" }}>
                  Toque para renovar e não perder o acesso
                </p>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: "rgba(239, 168, 68, 0.4)" }} />
            </motion.div>
          )}

          {/* Greeting */}
          <motion.div variants={stagger.item} className="text-center">
             <h1 className="text-xl md:text-2xl font-bold tracking-tight transition-colors duration-500" style={{ color: t.greeting }}>
              Seja bem-vindo(a), {userName}
            </h1>
            <p className="text-xs md:text-sm mt-1 transition-colors duration-500" style={{ color: t.phrase, fontFamily: "'Montserrat', sans-serif" }}>{phrase}</p>
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
          <motion.div variants={stagger.item} className="flex gap-2 p-1.5 rounded-2xl transition-colors duration-500" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {(["menu", "info"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer"
                style={{
                  background: activeTab === tab ? "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.08))" : "transparent",
                  color: activeTab === tab ? "rgba(139, 92, 246, 0.95)" : "rgba(255,255,255,0.5)",
                  border: activeTab === tab ? "1px solid rgba(139, 92, 246, 0.3)" : "1px solid transparent",
                  boxShadow: activeTab === tab ? "0 0 20px rgba(139, 92, 246, 0.1)" : "none",
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
                className="space-y-3"
              >
                {/* WhatsApp Channel - Obrigatório */}
                <motion.a
                  href="https://chat.whatsapp.com/Jqr0RcGIzQ6G91vbLyunDo"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="block w-full rounded-2xl px-4 md:px-5 py-4 md:py-5 transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, rgba(37, 211, 102, 0.12), rgba(37, 211, 102, 0.04))",
                    border: "1px solid rgba(37, 211, 102, 0.25)",
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden" style={{ background: "rgba(37, 211, 102, 0.15)" }}>
                      <img src={ratariaIcon} alt="@rataria.io" className="w-8 h-8 md:w-9 md:h-9 object-contain" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-sm md:text-base font-bold" style={{ color: "rgba(37, 211, 102, 0.95)" }}>
                          Canal de Avisos
                        </p>
                        <span className="px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider animate-pulse" style={{ background: "rgba(239, 68, 68, 0.2)", color: "rgba(248, 113, 113, 0.95)", border: "1px solid rgba(239, 68, 68, 0.4)" }}>
                          Obrigatório
                        </span>
                      </div>
                      <p className="text-[11px] md:text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                        Entre no canal <strong style={{ color: "rgba(255,255,255,0.7)" }}>@rataria.io</strong> no WhatsApp
                      </p>
                      <p className="text-[10px] md:text-xs mt-1.5" style={{ color: "rgba(248, 113, 113, 0.8)" }}>
                        Todos os problemas e soluções das ferramentas serão atualizados por lá
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5" style={{ color: "rgba(37, 211, 102, 0.5)" }} />
                  </div>
                </motion.a>

                {menuItems.map((item, i) => {
                  const isFerramentas = item.id === "ferramentas";
                  return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (i + 1) * 0.05, type: "spring", stiffness: 300, damping: 24 }}
                    whileHover={!item.locked ? { scale: 1.02 } : {}}
                    whileTap={!item.locked ? { scale: 0.98 } : {}}
                    className={`relative w-full flex items-center gap-4 rounded-2xl px-4 md:px-5 py-4 md:py-5 transition-all duration-200 ${item.locked ? "cursor-not-allowed" : ""} ${isFerramentas ? "overflow-hidden" : ""}`}
                    style={{
                      background: item.locked
                        ? "rgba(255,255,255,0.03)"
                        : `linear-gradient(135deg, rgba(${item.color}, 0.12), rgba(${item.color}, 0.04))`,
                      border: isFerramentas ? "none" : `1px solid rgba(${item.color}, ${item.locked ? 0.08 : 0.25})`,
                      opacity: item.locked ? 0.45 : 1,
                      boxShadow: isFerramentas ? "0 0 20px rgba(139, 92, 246, 0.25), 0 0 40px rgba(139, 92, 246, 0.1)" : "none",
                    }}
                    onClick={() => {
                      if (!item.locked && item.id === "ferramentas") navigate("/ferramentas");
                      if (!item.locked && item.id === "suporte") window.open("https://wa.me/5511922926559?text=Ol%C3%A1%2C%20preciso%20de%20ajuda!", "_blank");
                    }}
                   >
                    {isFerramentas && (
                      <div className="absolute inset-0 rounded-2xl" style={{
                        padding: "1.5px",
                        background: "linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(168, 85, 247, 0.4), rgba(139, 92, 246, 0.8))",
                        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                        pointerEvents: "none",
                      }} />
                    )}
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: `rgba(${item.color}, 0.15)` }}>
                      <item.icon className="w-6 h-6 md:w-7 md:h-7" style={{ color: `rgba(${item.color}, 0.85)` }} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm md:text-base font-bold" style={{ color: `rgba(${item.color}, 0.95)` }}>{item.label}</p>
                      <p className="text-[11px] md:text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{item.desc}</p>
                    </div>
                    {item.locked ? (
                      <Lock className="w-5 h-5" style={{ color: `rgba(${item.color}, 0.3)` }} />
                    ) : (
                      <ChevronRight className="w-5 h-5" style={{ color: `rgba(${item.color}, 0.5)` }} />
                    )}
                  </motion.button>
                  );
                })}

                {/* Affiliate button */}
                <motion.a
                  href="https://navenaut.com/affiliates/products"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="block w-full rounded-2xl px-4 md:px-5 py-4 md:py-5 transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(249, 115, 22, 0.05))",
                    border: "1px solid rgba(249, 115, 22, 0.3)",
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(249, 115, 22, 0.15)" }}>
                      <TrendingUp className="w-6 h-6 md:w-7 md:h-7" style={{ color: "rgba(249, 115, 22, 0.9)" }} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm md:text-base font-bold" style={{ color: "rgba(249, 115, 22, 0.95)" }}>Seja um Afiliado</p>
                      <p className="text-[11px] md:text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>Ganhe comissões de até <strong style={{ color: "rgba(249, 115, 22, 0.9)" }}>70%</strong> no valor da venda</p>
                    </div>
                    <ChevronRight className="w-5 h-5" style={{ color: "rgba(249, 115, 22, 0.5)" }} />
                  </div>
                </motion.a>
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

                {/* Minha Conta button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAccount(true)}
                  className="w-full rounded-2xl px-4 md:px-5 py-4 md:py-5 transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(59, 130, 246, 0.04))",
                    border: "1px solid rgba(59, 130, 246, 0.25)",
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(59, 130, 246, 0.15)" }}>
                      <User className="w-6 h-6 md:w-7 md:h-7" style={{ color: "rgba(59, 130, 246, 0.85)" }} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm md:text-base font-bold" style={{ color: "rgba(59, 130, 246, 0.95)" }}>Minha Conta</p>
                      <p className="text-[11px] md:text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>Dados da sua assinatura</p>
                    </div>
                    <ChevronRight className="w-5 h-5" style={{ color: "rgba(59, 130, 246, 0.5)" }} />
                  </div>
                </motion.button>

                {/* Fazer Upgrade button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPlans(true)}
                  className="w-full rounded-2xl px-4 md:px-5 py-4 md:py-5 transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(139, 92, 246, 0.15)" }}>
                      <ArrowUpCircle className="w-6 h-6 md:w-7 md:h-7" style={{ color: "rgba(139, 92, 246, 0.9)" }} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm md:text-base font-bold" style={{ color: "rgba(139, 92, 246, 0.95)" }}>Fazer Upgrade</p>
                      <p className="text-[11px] md:text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>Mude para um plano com mais benefícios</p>
                    </div>
                    <ChevronRight className="w-5 h-5" style={{ color: "rgba(139, 92, 246, 0.5)" }} />
                  </div>
                </motion.button>
              </motion.div>
             )}
          </AnimatePresence>


          {/* Logout */}
          <motion.div variants={stagger.item} className="flex justify-center pt-4 pb-2">
            <motion.button
              whileHover={{ scale: 1.08, opacity: 0.8 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => { localStorage.removeItem("naut_subscription"); navigate("/usuario"); }}
              className="flex flex-col items-center gap-1 px-6 py-2"
            >
              <Power className="w-5 h-5" style={{ color: t.logoutColor }} />
              <span className="text-[10px] font-medium" style={{ color: t.logoutColor }}>Deslogar</span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      <AccountModal
        open={showAccount}
        onClose={() => setShowAccount(false)}
        subData={subData}
        activeSub={activeSub}
        daysRemaining={daysRemaining}
        statusText={statusText}
      />

      <PlansPopup
        open={showPlans}
        onClose={() => setShowPlans(false)}
        title="Upgrade de Plano"
        description="Escolha o melhor plano para você e aproveite todos os benefícios!"
      />
    </div>
  );
}
