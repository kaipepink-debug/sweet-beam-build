import { Check, Crown, Shield, ArrowRight } from "lucide-react";
import { appendUtmToUrl } from "@/lib/utm";

const plans = [
  {
    name: "Weekly",
    price: "13",
    period: "/week",
    highlight: true,
    badge: "Pay Weekly",
    link: "https://checkout.navenaut.com/KXAsP?offer=semanal",
    discount: null,
    features: [
      "Unlimited access to +300 AI tools",
      "All Premium and Pro versions included",
      "Automatic real-time updates",
      "Secure account with enterprise-level protection",
      "Dedicated and priority 24/7 support",
      "New tools added every week",
      "No hidden fees or extra charges",
    ],
    guarantee: null,
  },
  {
    name: "Semiannual",
    price: "89",
    period: "/6 months",
    highlight: false,
    badge: null,
    link: "https://checkout.navenaut.com/KXAsP?offer=semestral",
    discount: "40% OFF",
    features: [
      "Unlimited access to +300 AI tools",
      "All Premium and Pro versions included",
      "Automatic real-time updates",
      "Secure account with enterprise-level protection",
      "Dedicated and priority 24/7 support",
      "New tools added every week",
      "No hidden fees or extra charges",
      "Exclusive Drive with AI Courses and Community",
      "1k/Day Method on WhatsApp",
      "Passive Income Strategy with Dark AI Channel",
      "Business Automation with No-Code",
      "Digital Marketing with AI (Black Niche)",
      "Lifetime Lovable Method",
      "Advanced TikTok ADS Mentorship",
    ],
    guarantee: "Apply it and make at least $2k in 30 days or your money back!",
  },
  {
    name: "Monthly",
    price: "24",
    period: "/month",
    highlight: false,
    badge: null,
    link: "https://checkout.navenaut.com/KXAsP",
    discount: null,
    features: [
      "Unlimited access to +300 AI tools",
      "All Premium and Pro versions included",
      "Automatic real-time updates",
      "Secure account with enterprise-level protection",
      "Dedicated and priority 24/7 support",
      "New tools added every week",
      "No hidden fees or extra charges",
    ],
    guarantee: null,
  },
];

const PlansSectionEN = () => {
  return (
    <section className="relative py-12 md:py-16 px-3 md:px-4" id="planos">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-3xl font-bold text-white mb-2 md:mb-3">
            Choose the{" "}
            <span className="relative inline-block neon-underline-text">
              perfect
              <span className="neon-trail" />
            </span>{" "}
            plan for you
          </h2>
          <p className="text-white/30 max-w-lg mx-auto text-base md:text-sm">
            All plans include full access to the most powerful AI tools on the market.
          </p>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-3 gap-3 md:gap-4 items-stretch md:items-center">
          {[plans[1], plans[0], plans[2]].map((plan, idx) => (
            <div
              key={plan.name}
              className={`relative rounded-xl overflow-hidden transition-transform hover:scale-[1.02] purple-hover-glow ${
                plan.highlight ? "md:scale-105 md:-my-3 md:order-none order-first" : ""
              }`}
              style={{
                background: plan.highlight ? "rgba(12, 5, 20, 0.95)" : "rgba(10, 10, 10, 0.6)",
                border: plan.highlight ? "1px solid rgba(180, 0, 255, 0.3)" : "1px solid rgba(255, 255, 255, 0.06)",
                backdropFilter: "blur(20px)",
                order: idx === 0 ? 2 : idx === 1 ? 1 : 3,
              }}
            >
              {plan.highlight && (
                <>
                  <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top center, rgba(180, 0, 255, 0.12), transparent 60%)" }} />
                  <div className="absolute -top-px left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(180, 0, 255, 0.6), transparent)" }} />
                </>
              )}

              <div className="relative p-4 md:p-6">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {plan.badge && (
                    <div className="flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5" style={{ color: "rgba(180, 0, 255, 0.8)" }} />
                      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(180, 0, 255, 0.8)" }}>
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  {plan.discount && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide"
                      style={{
                        background: plan.highlight ? "rgba(180, 0, 255, 0.15)" : "rgba(34, 197, 94, 0.1)",
                        color: plan.highlight ? "rgba(180, 0, 255, 0.9)" : "rgba(34, 197, 94, 0.9)",
                        border: plan.highlight ? "1px solid rgba(180, 0, 255, 0.25)" : "1px solid rgba(34, 197, 94, 0.2)",
                      }}
                    >
                      {plan.discount}
                    </span>
                  )}
                </div>

                <h3 className={`font-semibold text-base mb-1.5 ${plan.highlight ? "text-white/90" : "text-white/70"}`}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className={`text-3xl font-black ${plan.highlight ? "text-white" : "text-white/90"}`}>
                    $ {plan.price}
                  </span>
                  <span className="text-white/30 text-xs">{plan.period}</span>
                </div>

                <div className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: plan.highlight ? "rgba(180, 0, 255, 0.7)" : "rgba(255, 255, 255, 0.3)" }} />
                      <span className={`text-sm md:text-xs leading-relaxed ${plan.highlight ? "text-white/60" : "text-white/40"}`}>
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                {plan.guarantee && (
                  <div className="mb-4 p-3 rounded-lg text-center" style={{ background: "rgba(34, 197, 94, 0.06)", border: "1px solid rgba(34, 197, 94, 0.15)" }}>
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Shield className="w-3.5 h-3.5" style={{ color: "rgba(34, 197, 94, 0.8)" }} />
                      <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "rgba(34, 197, 94, 0.8)" }}>
                        Guarantee
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed" style={{ color: "rgba(34, 197, 94, 0.7)" }}>
                      {plan.guarantee}
                    </p>
                  </div>
                )}

                <a
                  href={appendUtmToUrl(plan.link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3 rounded-lg font-semibold text-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-2 ${
                    plan.highlight ? "text-white/95" : "text-white/70 hover:text-white/90"
                  }`}
                  style={
                    plan.highlight
                      ? {
                          background: "linear-gradient(135deg, rgba(180, 0, 255, 0.4), rgba(120, 0, 200, 0.3))",
                          border: "1px solid rgba(180, 0, 255, 0.4)",
                          boxShadow: "0 4px 25px rgba(180, 0, 255, 0.2)",
                        }
                      : {
                          background: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                        }
                  }
                >
                  Get started now
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlansSectionEN;
