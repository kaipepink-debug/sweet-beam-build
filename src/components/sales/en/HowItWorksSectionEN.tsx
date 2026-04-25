import { CreditCard, LayoutDashboard, Rocket } from "lucide-react";

const steps = [
  { icon: CreditCard, num: "01", title: "Choose your plan", desc: "Select the ideal plan for your needs." },
  { icon: LayoutDashboard, num: "02", title: "Access the panel", desc: "Log into the dashboard and explore all the tools." },
  { icon: Rocket, num: "03", title: "Start using", desc: "Use the AIs immediately, with no setup required." },
];

const HowItWorksSectionEN = () => {
  return (
    <section className="relative py-12 md:py-16 px-3 md:px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-3xl font-bold text-white mb-2 md:mb-3">
            How it <span className="text-white/70">works</span>
          </h2>
        </div>

        <div className="relative flex flex-col md:flex-row gap-6 md:gap-3 items-center justify-between">
          {steps.map((step) => (
            <div key={step.num} className="relative flex-1 text-center z-10 purple-hover-glow rounded-xl p-3">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "rgba(180, 0, 255, 0.06)", border: "1px solid rgba(180, 0, 255, 0.15)" }}
              >
                <step.icon className="w-6 h-6" style={{ color: "rgba(180, 0, 255, 0.5)" }} />
              </div>
              <span className="text-[9px] font-bold text-white/20 tracking-widest">{step.num}</span>
              <h3 className="text-white/80 font-semibold mt-1 mb-1.5 text-base md:text-sm">{step.title}</h3>
              <p className="text-white/30 text-sm md:text-xs max-w-[180px] mx-auto">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSectionEN;
