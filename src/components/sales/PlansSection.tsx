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
            Escolha o plano <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">perfeito</span> para você
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 items-center">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`relative rounded-2xl overflow-hidden transition-transform hover:scale-[1.02] ${
                plan.highlight
                  ? "border-2 border-purple-500/40 bg-white/[0.04] md:scale-105 md:-my-4"
                  : "border border-white/10 bg-white/[0.02]"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {plan.highlight && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-[60px]" />
                </>
              )}

              <div className="relative p-8">
                {plan.badge && (
                  <div className="flex items-center gap-1.5 mb-4">
                    <Crown className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <h3 className="text-white font-semibold text-lg mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">R$ {plan.price}</span>
                  <span className="text-white/40 text-sm">/mês</span>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-3">
                      <Check className={`w-4 h-4 shrink-0 ${plan.highlight ? "text-purple-400" : "text-cyan-400"}`} />
                      <span className="text-white/60 text-sm">{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`w-full py-3.5 rounded-xl font-semibold transition-all hover:scale-[1.02] ${
                    plan.highlight
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_30px_rgba(168,85,247,0.25)]"
                      : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                  }`}
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
