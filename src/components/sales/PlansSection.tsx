import { motion } from "framer-motion";
import { Check, Crown } from "lucide-react";

const plans = [
  {
    name: "Plus",
    price: "49,90",
    highlight: false,
    features: [
      "Acesso a 50+ ferramentas",
      "Atualizações mensais",
      "Suporte por e-mail",
      "1 usuário",
    ],
  },
  {
    name: "Super Premium",
    price: "159,90",
    highlight: true,
    badge: "Mais Popular",
    features: [
      "Acesso a +300 ferramentas",
      "Atualizações em tempo real",
      "Suporte prioritário 24/7",
      "Até 5 usuários",
      "API de integração",
      "Ferramentas exclusivas",
    ],
  },
  {
    name: "Premium",
    price: "79,90",
    highlight: false,
    features: [
      "Acesso a 150+ ferramentas",
      "Atualizações semanais",
      "Suporte por chat",
      "Até 2 usuários",
      "Relatórios de uso",
    ],
  },
];

const PlansSection = () => {
  return (
    <section className="relative py-24 px-4" id="planos">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Escolha o plano <span className="text-white/70">perfeito</span> para você
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 items-center">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`relative rounded-2xl overflow-hidden transition-transform hover:scale-[1.02] ${
                plan.highlight
                  ? "border border-white/20 md:scale-105 md:-my-4"
                  : "border border-white/8"
              }`}
              style={{
                background: plan.highlight
                  ? "rgba(15, 15, 15, 0.9)"
                  : "rgba(10, 10, 10, 0.6)",
                backdropFilter: "blur(20px)",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {plan.highlight && (
                <div className="absolute inset-0" style={{ background: "radial-gradient(circle at top, rgba(255,255,255,0.04), transparent)" }} />
              )}

              <div className="relative p-8">
                {plan.badge && (
                  <div className="flex items-center gap-1.5 mb-4">
                    <Crown className="w-4 h-4 text-white/50" />
                    <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <h3 className="text-white/80 font-semibold text-lg mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">R$ {plan.price}</span>
                  <span className="text-white/30 text-sm">/mês</span>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-3">
                      <Check className="w-4 h-4 shrink-0 text-white/40" />
                      <span className="text-white/50 text-sm">{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`w-full py-3.5 rounded-xl font-semibold transition-all hover:scale-[1.02] ${
                    plan.highlight
                      ? "text-white/95"
                      : "text-white/70 hover:text-white/90"
                  }`}
                  style={
                    plan.highlight
                      ? {
                          background: "linear-gradient(135deg, rgba(60, 60, 60, 1), rgba(40, 40, 40, 1))",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
                        }
                      : {
                          background: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                        }
                  }
                >
                  Começar agora
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlansSection;
