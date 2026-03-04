import { motion } from "framer-motion";
import { Wallet, Layers, RefreshCw, Shield, Headphones, Rocket } from "lucide-react";

const benefits = [
  { icon: Wallet, title: "Economia Inteligente", desc: "Reduza drasticamente seus custos com ferramentas de IA pagando apenas uma fração do valor. Dependendo do seu plano, a economia pode chegar a milhares de reais por ano." },
  { icon: Layers, title: "Acesso Estratégico por Plano", desc: "Tenha acesso às ferramentas de acordo com o plano escolhido, com período de utilização definido. Cada plano entrega o melhor custo-benefício." },
  { icon: RefreshCw, title: "Catálogo em Evolução Constante", desc: "Novas ferramentas são adicionadas regularmente, acompanhando as tendências e inovações do mercado de Inteligência Artificial." },
  { icon: Rocket, title: "Sempre nas Versões Mais Recentes", desc: "Você utiliza as ferramentas sempre atualizadas, acompanhando melhorias, recursos e evoluções tecnológicas." },
  { icon: Shield, title: "Segurança de Nível Profissional", desc: "Infraestrutura protegida, controle de acesso estruturado e proteção de dados seguindo padrões modernos de segurança digital." },
  { icon: Headphones, title: "Suporte Ágil e Humanizado", desc: "Atendimento rápido e direto para resolver dúvidas, auxiliar no acesso e garantir que sua experiência seja fluida e eficiente." },
];

const BenefitsSection = () => {
  return (
    <section id="beneficios" className="relative py-24 px-4">
      {/* Neon orbit line CSS */}
      <style>{`
        @keyframes orbit-flow {
          0% { offset-distance: 0%; }
          100% { offset-distance: 100%; }
        }
        .orbit-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .orbit-path {
          fill: none;
          stroke: rgba(180, 0, 255, 0.08);
          stroke-width: 1.5;
        }
        .orbit-dot {
          offset-path: path(var(--orbit-d));
          animation: orbit-flow 12s linear infinite;
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Benefícios <span className="text-white/70">Exclusivos</span>
          </h2>
          <p className="text-white/30 max-w-xl mx-auto">
            Tudo o que você precisa para dominar o universo da inteligência artificial.
          </p>
        </motion.div>

        {/* Grid with orbit line */}
        <div className="relative">
          {/* SVG orbit line that weaves through cards */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox="0 0 1200 820"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient id="orbit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(180,0,255,0.0)" />
                <stop offset="30%" stopColor="rgba(180,0,255,0.15)" />
                <stop offset="50%" stopColor="rgba(180,0,255,0.25)" />
                <stop offset="70%" stopColor="rgba(180,0,255,0.15)" />
                <stop offset="100%" stopColor="rgba(180,0,255,0.0)" />
              </linearGradient>
              <filter id="orbit-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* The continuous path weaving through 3x2 grid */}
            <path
              d="M 60,130 C 60,60 200,40 200,130 L 200,260 C 200,300 400,300 400,260 L 400,130 C 400,40 600,40 600,130 L 600,260 C 600,340 800,340 800,260 L 800,130 C 800,40 1000,40 1000,130 L 1000,260 C 1000,340 1200,360 1140,260 
                   M 1140,420 C 1200,380 1000,380 1000,420 L 1000,560 C 1000,640 800,640 800,560 L 800,420 C 800,380 600,360 600,420 L 600,560 C 600,640 400,640 400,560 L 400,420 C 400,360 200,360 200,420 L 200,560 C 200,640 60,660 60,560 L 60,420"
              stroke="url(#orbit-grad)"
              strokeWidth="1.5"
              filter="url(#orbit-glow)"
              className="orbit-path"
            />
            {/* Animated glowing dot */}
            <circle r="4" fill="rgba(180,0,255,0.9)">
              <animateMotion
                dur="14s"
                repeatCount="indefinite"
                path="M 60,130 C 60,60 200,40 200,130 L 200,260 C 200,300 400,300 400,260 L 400,130 C 400,40 600,40 600,130 L 600,260 C 600,340 800,340 800,260 L 800,130 C 800,40 1000,40 1000,130 L 1000,260 C 1000,340 1140,340 1140,420 C 1140,500 1000,380 1000,420 L 1000,560 C 1000,640 800,640 800,560 L 800,420 C 800,380 600,360 600,420 L 600,560 C 600,640 400,640 400,560 L 400,420 C 400,360 200,360 200,420 L 200,560 C 200,640 60,660 60,560 L 60,420 C 60,380 60,200 60,130"
              />
              <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
            </circle>
            {/* Glow trail */}
            <circle r="12" fill="rgba(180,0,255,0.15)">
              <animateMotion
                dur="14s"
                repeatCount="indefinite"
                path="M 60,130 C 60,60 200,40 200,130 L 200,260 C 200,300 400,300 400,260 L 400,130 C 400,40 600,40 600,130 L 600,260 C 600,340 800,340 800,260 L 800,130 C 800,40 1000,40 1000,130 L 1000,260 C 1000,340 1140,340 1140,420 C 1140,500 1000,380 1000,420 L 1000,560 C 1000,640 800,640 800,560 L 800,420 C 800,380 600,360 600,420 L 600,560 C 600,640 400,640 400,560 L 400,420 C 400,360 200,360 200,420 L 200,560 C 200,640 60,660 60,560 L 60,420 C 60,380 60,200 60,130"
              />
            </circle>
          </svg>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                className="group p-6 rounded-2xl border border-white/[0.06] hover:border-purple-500/20 transition-all duration-500"
                style={{ background: "rgba(8, 8, 12, 0.6)", backdropFilter: "blur(20px)" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(180,0,255,0.15)]"
                  style={{ background: "rgba(180, 0, 255, 0.06)", border: "1px solid rgba(180, 0, 255, 0.1)" }}
                >
                  <b.icon className="w-5 h-5" style={{ color: "rgba(180, 0, 255, 0.6)" }} />
                </div>
                <h3 className="text-white/90 font-semibold mb-2 text-[15px]">{b.title}</h3>
                <p className="text-white/35 text-sm leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
