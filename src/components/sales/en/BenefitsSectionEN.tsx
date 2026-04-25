import { Wallet, Layers, RefreshCw, Shield, Headphones, Rocket } from "lucide-react";

const benefits = [
  { icon: Wallet, title: "Smart Savings", desc: "Drastically reduce your AI tooling costs by paying just a fraction of the price. Depending on your plan, savings can reach thousands of dollars per year." },
  { icon: Layers, title: "Strategic Plan-Based Access", desc: "Get access to tools according to your chosen plan, with a defined usage period. Each plan delivers the best cost-benefit ratio." },
  { icon: RefreshCw, title: "Constantly Evolving Catalog", desc: "New tools are added regularly, keeping up with trends and innovations in the Artificial Intelligence market." },
  { icon: Rocket, title: "Always the Latest Versions", desc: "You always use up-to-date tools, following improvements, features and technological evolutions." },
  { icon: Shield, title: "Professional-Grade Security", desc: "Protected infrastructure, structured access control and data protection following modern digital security standards." },
  { icon: Headphones, title: "Fast and Human Support", desc: "Quick and direct assistance to solve doubts, help with access and ensure your experience is smooth and efficient." },
];

const BenefitsSectionEN = () => {
  return (
    <section id="beneficios" className="relative py-12 md:py-16 px-3 md:px-4">
      <style>{`
        @keyframes orbit-flow { 0% { offset-distance: 0%; } 100% { offset-distance: 100%; } }
        .orbit-container { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
        .orbit-path { fill: none; stroke: rgba(180, 0, 255, 0.08); stroke-width: 1.5; }
      `}</style>

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-3xl font-bold text-white mb-2 md:mb-3">
            Exclusive <span className="text-white/70">Benefits</span>
          </h2>
          <p className="text-white/30 max-w-lg mx-auto text-base md:text-sm">
            Everything you need to dominate the artificial intelligence universe.
          </p>
        </div>

        <div className="relative">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 relative z-10">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="group p-4 md:p-5 rounded-xl border border-white/[0.06] hover:border-purple-500/20 transition-all duration-500 purple-hover-glow"
                style={{ background: "rgba(8, 8, 12, 0.6)", backdropFilter: "blur(20px)" }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(180,0,255,0.15)]"
                  style={{ background: "rgba(180, 0, 255, 0.06)", border: "1px solid rgba(180, 0, 255, 0.1)" }}
                >
                  <b.icon className="w-4 h-4" style={{ color: "rgba(180, 0, 255, 0.6)" }} />
                </div>
                <h3 className="text-white/90 font-semibold mb-1.5 text-base md:text-sm">{b.title}</h3>
                <p className="text-white/35 text-sm md:text-xs leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSectionEN;
