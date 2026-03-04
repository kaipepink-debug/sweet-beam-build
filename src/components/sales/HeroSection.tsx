import { motion } from "framer-motion";
import { Bot, Sparkles, Zap, Brain, Cpu, Globe, Layers } from "lucide-react";
import ratariaLogo from "@/assets/rataria-logo-full.png";

const floatingIcons = [
  { icon: Bot, x: -180, y: -60, delay: 0 },
  { icon: Sparkles, x: 200, y: -80, delay: 0.2 },
  { icon: Zap, x: -220, y: 40, delay: 0.4 },
  { icon: Brain, x: 240, y: 60, delay: 0.6 },
  { icon: Cpu, x: -140, y: 100, delay: 0.8 },
  { icon: Globe, x: 160, y: 120, delay: 1 },
];

const HeroSection = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden pt-24">
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px]" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.03), transparent)" }} />

      <div className="relative z-10 text-center max-w-5xl mx-auto">
        {/* Floating icons */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {floatingIcons.map((item, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ x: item.x, y: item.y }}
              animate={{ y: [item.y - 10, item.y + 10, item.y - 10] }}
              transition={{ duration: 4, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
            >
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                <item.icon className="w-5 h-5 text-white/40" />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <img src={ratariaLogo} alt="ratarIA" className="h-16 md:h-20 mb-6 opacity-80" />
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-white/5 text-white/60 border border-white/10 mb-8">
            <Layers className="w-3.5 h-3.5" />
            +300 Ferramentas de IA em um só lugar
          </span>
        </motion.div>

        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <span className="text-white">Centralize as </span>
          <span className="text-white/90">melhores IAs</span>
          <br />
          <span className="text-white">do mundo em um </span>
          <span className="text-white/90">único acesso</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Uma biblioteca completa de ferramentas de IA, pagando apenas uma fração do preço original.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
        >
          <button className="group relative px-8 py-4 rounded-xl font-semibold text-white overflow-hidden transition-transform hover:scale-105">
            <div className="absolute inset-0 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(60, 60, 60, 1), rgba(40, 40, 40, 1))" }} />
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(135deg, rgba(80, 80, 80, 1), rgba(60, 60, 60, 1))" }} />
            <div className="absolute inset-0 rounded-xl" style={{ boxShadow: "0 0 30px rgba(255,255,255,0.05)" }} />
            <span className="relative z-10" style={{ color: "rgba(255,255,255,0.95)" }}>Conhecer Ferramentas</span>
          </button>

          <button className="px-8 py-4 rounded-xl font-semibold text-white/70 border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all hover:scale-105">
            Ver Planos
          </button>
        </motion.div>
      </div>

      {/* Bottom luminous curve */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)" }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-32 blur-[80px] rounded-full" style={{ background: "rgba(255,255,255,0.02)" }} />
    </section>
  );
};

export default HeroSection;
