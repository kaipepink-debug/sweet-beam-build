import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import ratariaLogo from "@/assets/rataria-logo-full.png";
import { useIsMobile } from "@/hooks/use-mobile";

import higgsFieldLogo from "@/assets/tools/higgsfield.png";
import grokLogo from "@/assets/tools/grok.png";
import heygenLogo from "@/assets/tools/heygen.png";
import soraLogo from "@/assets/tools/sora.png";
import claudeLogo from "@/assets/tools/claude.png";
import freepikLogo from "@/assets/tools/freepik.png";

const floatingIcons = [
  { logo: higgsFieldLogo, name: "Higgsfield", x: -380, y: -120, mobileX: -120, mobileY: -160, delay: 0 },
  { logo: grokLogo, name: "Grok", x: 400, y: -140, mobileX: 120, mobileY: -220, delay: 0.2 },
  { logo: heygenLogo, name: "Heygen", x: -420, y: 30, mobileX: -140, mobileY: -60, delay: 0.4 },
  { logo: soraLogo, name: "Sora", x: 440, y: 50, mobileX: 140, mobileY: 40, delay: 0.6 },
  { logo: claudeLogo, name: "Claude", x: -360, y: 160, mobileX: -110, mobileY: 260, delay: 0.8 },
  { logo: freepikLogo, name: "Freepik", x: 380, y: 180, mobileX: 110, mobileY: 290, delay: 1 },
];

const HeroSection = () => {
  const isMobile = useIsMobile();

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden pt-24">
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px]" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.03), transparent)" }} />

      <div className="relative z-10 text-center max-w-5xl mx-auto">
        {/* Floating icons */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {floatingIcons.map((item, i) => {
            const posX = isMobile ? item.mobileX : item.x;
            const posY = isMobile ? item.mobileY : item.y;
            return (
              <motion.div
                key={i}
                className="absolute"
                style={{ x: posX, y: posY }}
                animate={{ y: [posY - 10, posY + 10, posY - 10] }}
                transition={{ duration: 4, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center backdrop-blur-sm overflow-hidden">
                  <img src={item.logo} alt={item.name} className="w-full h-full object-cover rounded-full" />
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <img src={ratariaLogo} alt="ratarIA" className="h-24 md:h-32 mb-6 opacity-85" />
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-white/5 text-white/60 border border-white/10 mb-8">
            <Layers className="w-3.5 h-3.5" />
            +300 Ferramentas de IA em um só lugar
          </span>
        </motion.div>

        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight leading-tight mb-6"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <span className="text-white">Centralize as </span>
          <span className="neon-underline-text relative inline-block">melhores IAs</span>
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
            <span className="relative z-10" style={{ color: "rgba(255,255,255,0.95)" }}>Conhecer Ferramentas</span>
          </button>

          <button className="neon-border-btn relative px-8 py-4 rounded-xl font-semibold text-white/70 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all hover:scale-105 overflow-hidden">
            <span className="neon-trail" style={{ borderRadius: "0.75rem" }} />
            <span className="relative z-10">Ver Planos</span>
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
