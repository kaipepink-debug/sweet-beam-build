import { motion } from "framer-motion";
import { Bot, Sparkles, Zap, Brain, Cpu, Globe } from "lucide-react";

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
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />

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
                <item.icon className="w-5 h-5 text-cyan-400/70" />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-8">
            🚀 +300 Ferramentas de IA em um só lugar
          </span>
        </motion.div>

        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <span className="text-white">Centralize as </span>
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            melhores IAs
          </span>
          <br />
          <span className="text-white">do mundo em um </span>
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            único acesso
          </span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10"
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
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl" />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 rounded-xl shadow-[0_0_30px_rgba(0,180,255,0.3)] group-hover:shadow-[0_0_40px_rgba(0,180,255,0.5)] transition-shadow" />
            <span className="relative z-10">Conhecer Ferramentas</span>
          </button>

          <button className="px-8 py-4 rounded-xl font-semibold text-white/80 border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all hover:scale-105">
            Ver Planos
          </button>
        </motion.div>
      </div>

      {/* Bottom luminous curve */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-32 bg-cyan-500/5 blur-[80px] rounded-full" />
    </section>
  );
};

export default HeroSection;
