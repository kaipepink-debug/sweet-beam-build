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
            Como <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">funciona</span>
          </h2>
        </motion.div>

        <div className="relative flex flex-col md:flex-row gap-8 md:gap-4 items-center justify-between">
          {/* Connection line */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-cyan-500/30"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              className="relative flex-1 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-7 h-7 text-cyan-400" />
              </div>
              <span className="text-[10px] font-bold text-cyan-500/50 tracking-widest">{step.num}</span>
              <h3 className="text-white font-semibold mt-1 mb-2">{step.title}</h3>
              <p className="text-white/40 text-sm max-w-[200px] mx-auto">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
