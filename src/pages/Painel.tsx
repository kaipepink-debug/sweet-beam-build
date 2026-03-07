import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wrench, User, Settings, CreditCard, LogOut } from "lucide-react";
import NeuralBackground from "@/components/sales/NeuralBackground";
import ratariaLogo from "@/assets/rataria-logo-full.png";

const menuItems = [
  { icon: Wrench, label: "Minhas Ferramentas", id: "ferramentas" },
  { icon: CreditCard, label: "Meu Plano", id: "plano" },
  { icon: User, label: "Meu Perfil", id: "perfil" },
  { icon: Settings, label: "Configurações", id: "config" },
];

export default function Painel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ferramentas");

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
        className="relative z-10 w-full max-w-2xl mx-4"
      >
        <div
          className="relative rounded-2xl p-8 md:p-12"
          style={{
            background: "rgba(10, 10, 10, 0.8)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 0 60px rgba(0, 0, 0, 0.4), 0 25px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)",
          }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex justify-center mb-6"
          >
            <img src={ratariaLogo} alt="ratarIA" className="h-20 w-auto rounded-lg" style={{ filter: "brightness(1.1)" }} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-xl font-bold tracking-[0.2em] uppercase mb-8"
            style={{ color: "rgba(255, 255, 255, 0.9)" }}
          >
            Painel do Usuário
          </motion.h1>

          {/* Menu Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {menuItems.map((item, i) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center gap-3 p-6 rounded-xl transition-all duration-300 hover:scale-105"
                style={{
                  background: activeTab === item.id ? "rgba(180, 0, 255, 0.15)" : "rgba(255, 255, 255, 0.04)",
                  border: activeTab === item.id ? "1px solid rgba(180, 0, 255, 0.3)" : "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <item.icon className="w-6 h-6" style={{ color: activeTab === item.id ? "rgba(200, 120, 255, 0.9)" : "rgba(255,255,255,0.5)" }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: activeTab === item.id ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)" }}>
                  {item.label}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Content Area */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-6 mb-6"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              minHeight: 120,
            }}
          >
            <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
              Conteúdo de <span className="font-semibold" style={{ color: "rgba(200, 120, 255, 0.9)" }}>{menuItems.find(m => m.id === activeTab)?.label}</span> será exibido aqui.
            </p>
          </motion.div>

          {/* Logout */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            onClick={() => navigate("/usuario")}
            className="neon-border-btn relative w-full py-3 rounded-xl text-sm font-medium uppercase tracking-[0.15em] transition-all duration-500 overflow-hidden"
            style={{ background: "transparent" }}
          >
            <span className="neon-trail" style={{ borderRadius: "0.75rem" }} />
            <span className="relative z-10 flex items-center justify-center gap-2" style={{ color: "rgba(255,255,255,0.7)" }}>
              <LogOut className="w-4 h-4" />
              Sair
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
