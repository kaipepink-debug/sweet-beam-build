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
  { logo: higgsFieldLogo, name: "Higgsfield", x: -320, y: -100, mobileX: -120, mobileY: -160, delay: 0 },
  { logo: grokLogo, name: "Grok", x: 340, y: -110, mobileX: 120, mobileY: -220, delay: 0 },
  { logo: heygenLogo, name: "Heygen", x: -350, y: 50, mobileX: -140, mobileY: -100, delay: 0 },
  { logo: soraLogo, name: "Sora", x: 370, y: 40, mobileX: 140, mobileY: 80, delay: 0 },
  { logo: claudeLogo, name: "Claude", x: -300, y: 130, mobileX: -110, mobileY: 260, delay: 0 },
  { logo: freepikLogo, name: "Freepik", x: 320, y: 150, mobileX: 110, mobileY: 290, delay: 0 },
];

const HeroSection = () => {
  const isMobile = useIsMobile();

  return (
    <section id="hero" className="relative min-h-[85vh] flex items-center justify-center px-3 md:px-4 overflow-hidden pt-16 md:pt-20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.03), transparent)" }} />

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Floating icons */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {floatingIcons.map((item, i) => {
            const posX = isMobile ? item.mobileX : item.x;
            const posY = isMobile ? item.mobileY : item.y;
            return isMobile ? (
              <div
                key={i}
                className={`absolute ${(item.name === "Claude" || item.name === "Freepik") ? "z-30" : "z-0"}`}
                style={{
                  ["--float-base" as any]: `translate(${posX}px, ${posY}px)`,
                  transform: `translate(${posX}px, ${posY}px)`,
                  animation: `gentle-float 2.2s ease-in-out infinite`,
                  animationDelay: "0s",
                }}
              >
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center backdrop-blur-sm overflow-hidden">
                  <img src={item.logo} alt={item.name} className="w-full h-full object-cover rounded-full" />
                </div>
              </div>
            ) : (
              <motion.div
                key={i}
                className="absolute z-0"
                style={{ x: posX, y: posY }}
                animate={{ y: [posY - 8, posY + 8, posY - 8] }}
                transition={{ duration: 4, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
              >
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center backdrop-blur-sm overflow-hidden">
                  <img src={item.logo} alt={item.name} className="w-full h-full object-cover rounded-full" />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex flex-col items-center animate-fade-in">
          <img src={ratariaLogo} alt="ratarIA" className="h-20 md:h-24 mb-5 opacity-85" />
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium bg-white/5 text-white/60 border border-white/10 mb-6">
            <Layers className="w-3 h-3" />
            +300 Ferramentas de IA em um só lugar
          </span>
        </div>

        <h1
          className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight mb-3 md:mb-5 animate-fade-in"
          style={{ fontFamily: "'Montserrat', sans-serif", animationDelay: "0.05s", animationFillMode: "both" }}
        >
          <span className="text-white">Centralize as </span>
          <span className="neon-underline-text relative inline-block">melhores IAs</span>
          <br />
          <span className="text-white">do mundo em um </span>
          <span className="text-white/90">único acesso</span>
        </h1>

        {/* Video */}
        <div
          className="relative mt-6 md:mt-8 mb-6 md:mb-8 w-full max-w-3xl mx-auto animate-fade-in rounded-2xl overflow-hidden border border-white/10"
          style={{ animationDelay: "0.08s", animationFillMode: "both", aspectRatio: "16/9" }}
        >
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/8WD3hnAGR2I?controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1&iv_load_policy=3&fs=0&autoplay=0"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <p
          className="text-sm md:text-lg text-white/40 max-w-xl mx-auto mb-6 md:mb-8 animate-fade-in"
          style={{ animationDelay: "0.1s", animationFillMode: "both" }}
        >
          Uma biblioteca completa de ferramentas de IA, pagando apenas uma fração do preço original.
        </p>

        <div
          className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in"
          style={{ animationDelay: "0.15s", animationFillMode: "both" }}
        >
          <a href="#ferramentas" onClick={(e) => { e.preventDefault(); document.querySelector('#ferramentas')?.scrollIntoView({ behavior: 'smooth' }); }} className="group relative px-6 py-3 rounded-xl font-semibold text-white overflow-hidden transition-transform hover:scale-105">
            <div className="absolute inset-0 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(60, 60, 60, 1), rgba(40, 40, 40, 1))" }} />
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "linear-gradient(135deg, rgba(80, 80, 80, 1), rgba(60, 60, 60, 1))" }} />
            <span className="relative z-10 text-sm" style={{ color: "rgba(255,255,255,0.95)" }}>Conhecer Ferramentas</span>
          </a>

          <a href="#planos" onClick={(e) => { e.preventDefault(); document.querySelector('#planos')?.scrollIntoView({ behavior: 'smooth' }); }} className="neon-border-btn relative px-6 py-3 rounded-xl font-semibold text-sm text-white/70 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all hover:scale-105 overflow-hidden">
            <span className="neon-trail" style={{ borderRadius: "0.75rem" }} />
            <span className="relative z-10">Ver Planos</span>
          </a>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)" }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-32 blur-[80px] rounded-full" style={{ background: "rgba(255,255,255,0.02)" }} />
    </section>
  );
};

export default HeroSection;
