import { motion } from "framer-motion";
import { Wallet, Infinity, RefreshCw, Shield, Headphones, Rocket } from "lucide-react";

const benefits = [
  { icon: Wallet, title: "Economia Real", desc: "Economize milhares de reais todos os meses com um único plano." },
  { icon: Infinity, title: "Acesso Ilimitado", desc: "Use quantas ferramentas quiser, sem limites ou restrições." },
  { icon: RefreshCw, title: "Atualizações Constantes", desc: "Novas ferramentas adicionadas frequentemente ao catálogo." },
  { icon: Rocket, title: "Sempre Atualizado", desc: "Todas as ferramentas na versão mais recente disponível." },
  { icon: Shield, title: "Conta Segura", desc: "Proteção de dados e acesso com segurança de nível enterprise." },
  { icon: Headphones, title: "Suporte Personalizado", desc: "Atendimento rápido e dedicado sempre que precisar." },
];

const BenefitsSection = () => {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Benefícios <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Exclusivos</span>
          </h2>
          <p className="text-white/40 max-w-xl mx-auto">
            Tudo o que você precisa para dominar o universo da inteligência artificial.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-cyan-500/20 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:shadow-[0_0_20px_rgba(0,180,255,0.15)] transition-shadow">
                <b.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{b.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
