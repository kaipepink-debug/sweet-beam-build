import { motion } from "framer-motion";
import { CreditCard, LayoutDashboard, Rocket } from "lucide-react";

const steps = [
  { icon: CreditCard, num: "01", title: "Escolha seu plano", desc: "Selecione o plano ideal para suas necessidades." },
  { icon: LayoutDashboard, num: "02", title: "Acesse o painel", desc: "Entre no dashboard e explore todas as ferramentas." },
  { icon: Rocket, num: "03", title: "Comece a usar", desc: "Utilize as IAs imediatamente, sem configuração." },
];

const HowItWorksSection = () => {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Como <span className="text-white/70">funciona</span>
          </h2>
        </motion.div>

        <div className="relative flex flex-col md:flex-row gap-8 md:gap-4 items-center justify-between">
          {/* Animated purple connection line — Desktop */}
          <svg
            className="hidden md:block absolute top-8 left-0 right-0 w-full pointer-events-none"
            style={{ height: "4px", zIndex: 0 }}
            viewBox="0 0 1000 4"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient id="hw-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(180,0,255,0)" />
                <stop offset="15%" stopColor="rgba(180,0,255,0.25)" />
                <stop offset="50%" stopColor="rgba(180,0,255,0.35)" />
                <stop offset="85%" stopColor="rgba(180,0,255,0.25)" />
                <stop offset="100%" stopColor="rgba(180,0,255,0)" />
              </linearGradient>
              <filter id="hw-glow">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <line x1="160" y1="2" x2="840" y2="2" stroke="url(#hw-line-grad)" strokeWidth="1.5" filter="url(#hw-glow)" />
            {/* Animated dot */}
            <circle r="4" fill="rgba(180,0,255,0.9)">
              <animate attributeName="cx" values="160;840;160" dur="4s" repeatCount="indefinite" />
              <animate attributeName="cy" values="2;2;2" dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
            </circle>
            {/* Glow trail */}
            <circle r="12" fill="rgba(180,0,255,0.12)">
              <animate attributeName="cx" values="160;840;160" dur="4s" repeatCount="indefinite" />
              <animate attributeName="cy" values="2;2;2" dur="4s" repeatCount="indefinite" />
            </circle>
          </svg>

          {/* Animated purple connection line — Mobile (vertical) */}
          <svg
            className="md:hidden absolute top-0 bottom-0 pointer-events-none"
            style={{ width: "4px", left: "50%", transform: "translateX(-50%)", height: "100%", zIndex: 0 }}
            viewBox="0 0 4 1000"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient id="hw-line-grad-v" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(180,0,255,0)" />
                <stop offset="15%" stopColor="rgba(180,0,255,0.2)" />
                <stop offset="50%" stopColor="rgba(180,0,255,0.3)" />
                <stop offset="85%" stopColor="rgba(180,0,255,0.2)" />
                <stop offset="100%" stopColor="rgba(180,0,255,0)" />
              </linearGradient>
            </defs>
            <line x1="2" y1="80" x2="2" y2="920" stroke="url(#hw-line-grad-v)" strokeWidth="1.5" />
            <circle r="4" fill="rgba(180,0,255,0.9)">
              <animate attributeName="cy" values="80;920;80" dur="4s" repeatCount="indefinite" />
              <animate attributeName="cx" values="2;2;2" dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle r="10" fill="rgba(180,0,255,0.1)">
              <animate attributeName="cy" values="80;920;80" dur="4s" repeatCount="indefinite" />
              <animate attributeName="cx" values="2;2;2" dur="4s" repeatCount="indefinite" />
            </circle>
          </svg>

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              className="relative flex-1 text-center z-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{
                  background: "rgba(180, 0, 255, 0.06)",
                  border: "1px solid rgba(180, 0, 255, 0.15)",
                }}
              >
                <step.icon className="w-7 h-7" style={{ color: "rgba(180, 0, 255, 0.5)" }} />
              </div>
              <span className="text-[10px] font-bold text-white/20 tracking-widest">{step.num}</span>
              <h3 className="text-white/80 font-semibold mt-1 mb-2">{step.title}</h3>
              <p className="text-white/30 text-sm max-w-[200px] mx-auto">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
