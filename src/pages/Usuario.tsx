import { motion } from "framer-motion";
import NeuralBackground from "@/components/sales/NeuralBackground";
import ratariaLogo from "@/assets/rataria-logo-full.png";
import { LogOut, Wrench, User, CreditCard, Settings } from "lucide-react";

const menuItems = [
  { icon: Wrench, label: "Minhas Ferramentas", desc: "Acesse todas as ferramentas de IA disponíveis no seu plano" },
  { icon: CreditCard, label: "Meu Plano", desc: "Gerencie sua assinatura e veja os detalhes do plano" },
  { icon: User, label: "Meu Perfil", desc: "Edite suas informações pessoais" },
  { icon: Settings, label: "Configurações", desc: "Preferências e ajustes da conta" },
];

const Usuario = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: "#000000" }}>
      <NeuralBackground />

      {/* Gradient overlay */}
      <div className="fixed inset-0 z-[1] pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(180, 0, 255, 0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(140, 0, 200, 0.03) 0%, transparent 50%)" }} />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-[120px]" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.15), transparent)" }} />
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[380px] md:max-w-lg mx-4"
      >
        <div
          className="relative rounded-2xl p-6 md:p-10"
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
            <img src={ratariaLogo} alt="ratarIA" className="h-16 w-auto rounded-lg" style={{ filter: "brightness(1.1)" }} />
          </motion.div>

          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1
              className="text-lg font-light tracking-[0.2em] uppercase mb-1"
              style={{ color: "rgba(255, 255, 255, 0.9)", fontFamily: "'Inter', sans-serif" }}
            >
              Área do Usuário
            </h1>
            <p className="text-xs tracking-[0.15em]" style={{ color: "rgba(180, 180, 180, 0.5)" }}>
              Bem-vindo de volta
            </p>
          </motion.div>

          {/* Menu Items */}
          <div className="space-y-3 mb-6">
            {menuItems.map((item, i) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all duration-300 group"
                style={{
                  background: "rgba(15, 15, 15, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(25, 25, 25, 0.8)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(15, 15, 15, 0.6)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.06)";
                }}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255, 255, 255, 0.4)" }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: "rgba(255, 255, 255, 0.85)" }}>{item.label}</p>
                  <p className="text-[11px]" style={{ color: "rgba(255, 255, 255, 0.3)" }}>{item.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Logout */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <a
              href="/"
              className="neon-border-btn relative w-full py-3 rounded-xl text-sm font-medium uppercase tracking-[0.15em] transition-all duration-500 overflow-hidden flex items-center justify-center gap-2"
              style={{ background: "transparent", color: "rgba(255, 255, 255, 0.7)" }}
            >
              <span className="neon-trail" style={{ borderRadius: "0.75rem" }} />
              <LogOut className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Sair</span>
            </a>
          </motion.div>

          {/* Bottom accent */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 h-px mx-auto w-24 origin-center"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)" }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Usuario;
