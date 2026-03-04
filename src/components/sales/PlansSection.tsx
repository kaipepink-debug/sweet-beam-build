import { Check, Crown, Shield, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Mensal",
    price: "67",
    period: "/mês",
    highlight: false,
    link: "https://funnel.navenaut.com/J8vSJ",
    discount: null,
    features: [
      "Acesso ilimitado a +300 ferramentas de IA",
      "Todas as versões Premium e Pro incluídas",
      "Atualizações automáticas em tempo real",
      "Conta segura com proteção nível enterprise",
      "Suporte dedicado e prioritário 24/7",
      "Novas ferramentas adicionadas toda semana",
      "Sem taxas ocultas ou cobranças extras",
    ],
    guarantee: null,
  },
  {
    name: "Anual",
    price: "497",
    period: "/ano",
    highlight: true,
    badge: "Mais Escolhido",
    link: "https://funnel.navenaut.com/aPEco",
    discount: "40% OFF",
    features: [
      "Acesso ilimitado a +300 ferramentas de IA",
      "Todas as versões Premium e Pro incluídas",
      "Atualizações automáticas em tempo real",
      "Conta segura com proteção nível enterprise",
      "Suporte dedicado e prioritário 24/7",
      "Novas ferramentas adicionadas toda semana",
      "Sem taxas ocultas ou cobranças extras",
      "Drive exclusivo com Cursos e Comunidade de IA",
      "Método 1k/Dia no WhatsApp",
      "Estratégia de Renda Passiva com Canal Dark IA",
      "Automação de Negócios com No-Code",
      "Marketing Digital com IA (Nicho Black)",
      "Método Lovable Vitalício",
      "Mentoria TikTok ADS Avançada",
    ],
    guarantee: "Aplique e Faça Pelo Menos R$ 10k em 30 dias ou seu dinheiro de volta!",
  },
  {
    name: "Semestral",
    price: "297",
    period: "/semestre",
    highlight: false,
    badge: null,
    link: "https://funnel.navenaut.com/N8Jzj",
    discount: "30% OFF",
    features: [
      "Tudo do plano Mensal +",
      "Drive exclusivo com Cursos e Comunidade de IA",
      "Método 1k/Dia no WhatsApp",
      "Estratégia de Renda Passiva com Canal Dark IA",
      "Automação de Negócios com No-Code",
      "Marketing Digital com IA (Nicho Black)",
    ],
    guarantee: null,
  },
];

const PlansSection = () => {
  return (
    <section className="relative py-24 px-4" id="planos">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Escolha o plano{" "}
            <span className="relative inline-block neon-underline-text">
              perfeito
              <span className="neon-trail" />
            </span>{" "}
            para você
          </h2>
          <p className="text-white/30 max-w-xl mx-auto">
            Todos os planos incluem acesso completo às ferramentas de IA mais poderosas do mercado.
          </p>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-3 gap-6 items-stretch md:items-center">
          {[plans[1], plans[0], plans[2]].map((plan, idx) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl overflow-hidden transition-transform hover:scale-[1.02] purple-hover-glow ${
                plan.highlight
                  ? "md:scale-105 md:-my-4 md:order-none order-first"
                  : ""
              }`}
              style={{
                background: plan.highlight
                  ? "rgba(12, 5, 20, 0.95)"
                  : "rgba(10, 10, 10, 0.6)",
                border: plan.highlight
                  ? "1px solid rgba(180, 0, 255, 0.3)"
                  : "1px solid rgba(255, 255, 255, 0.06)",
                backdropFilter: "blur(20px)",
                order: idx === 0 ? 2 : idx === 1 ? 1 : 3,
              }}
            >
              {plan.highlight && (
                <>
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(ellipse at top center, rgba(180, 0, 255, 0.12), transparent 60%)",
                    }}
                  />
                  <div
                    className="absolute -top-px left-0 right-0 h-[2px]"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(180, 0, 255, 0.6), transparent)",
                    }}
                  />
                </>
              )}

              <div className="relative p-8">
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {plan.badge && (
                    <div className="flex items-center gap-1.5">
                      <Crown
                        className="w-4 h-4"
                        style={{ color: "rgba(180, 0, 255, 0.8)" }}
                      />
                      <span
                        className="text-xs font-bold uppercase tracking-widest"
                        style={{ color: "rgba(180, 0, 255, 0.8)" }}
                      >
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  {plan.discount && (
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide"
                      style={{
                        background: plan.highlight
                          ? "rgba(180, 0, 255, 0.15)"
                          : "rgba(34, 197, 94, 0.1)",
                        color: plan.highlight
                          ? "rgba(180, 0, 255, 0.9)"
                          : "rgba(34, 197, 94, 0.9)",
                        border: plan.highlight
                          ? "1px solid rgba(180, 0, 255, 0.25)"
                          : "1px solid rgba(34, 197, 94, 0.2)",
                      }}
                    >
                      {plan.discount}
                    </span>
                  )}
                </div>

                <h3
                  className={`font-semibold text-lg mb-2 ${
                    plan.highlight ? "text-white/90" : "text-white/70"
                  }`}
                >
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span
                    className={`text-4xl font-black ${
                      plan.highlight ? "text-white" : "text-white/90"
                    }`}
                  >
                    R$ {plan.price}
                  </span>
                  <span className="text-white/30 text-sm">{plan.period}</span>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-3">
                      <Check
                        className="w-4 h-4 shrink-0 mt-0.5"
                        style={{
                          color: plan.highlight
                            ? "rgba(180, 0, 255, 0.7)"
                            : "rgba(255, 255, 255, 0.3)",
                        }}
                      />
                      <span
                        className={`text-sm leading-relaxed ${
                          plan.highlight ? "text-white/60" : "text-white/40"
                        }`}
                      >
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                {plan.guarantee && (
                  <div
                    className="mb-6 p-4 rounded-xl text-center"
                    style={{
                      background: "rgba(34, 197, 94, 0.06)",
                      border: "1px solid rgba(34, 197, 94, 0.15)",
                    }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Shield
                        className="w-4 h-4"
                        style={{ color: "rgba(34, 197, 94, 0.8)" }}
                      />
                      <span
                        className="text-xs font-bold uppercase tracking-wide"
                        style={{ color: "rgba(34, 197, 94, 0.8)" }}
                      >
                        Garantia
                      </span>
                    </div>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "rgba(34, 197, 94, 0.7)" }}
                    >
                      {plan.guarantee}
                    </p>
                  </div>
                )}

                <a
                  href={plan.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3.5 rounded-xl font-semibold transition-all hover:scale-[1.02] flex items-center justify-center gap-2 ${
                    plan.highlight ? "text-white/95" : "text-white/70 hover:text-white/90"
                  }`}
                  style={
                    plan.highlight
                      ? {
                          background:
                            "linear-gradient(135deg, rgba(180, 0, 255, 0.4), rgba(120, 0, 200, 0.3))",
                          border: "1px solid rgba(180, 0, 255, 0.4)",
                          boxShadow: "0 4px 25px rgba(180, 0, 255, 0.2)",
                        }
                      : {
                          background: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                        }
                  }
                >
                  Começar agora
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlansSection;
