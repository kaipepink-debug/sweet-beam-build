import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

const SupportSection = () => {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-xl mx-auto text-center">
        <motion.div
          className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-10 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/5 rounded-full blur-[60px]" />

          <MessageCircle className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Estamos aqui para ajudá-lo</h2>
          <p className="text-white/40 text-sm mb-8 max-w-sm mx-auto">
            Fale com nossa equipe especializada e tire todas as suas dúvidas em tempo real.
          </p>

          <a
            href="https://wa.me/5500000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all hover:scale-[1.02] shadow-[0_0_25px_rgba(16,185,129,0.2)]"
          >
            <MessageCircle className="w-5 h-5" />
            Falar no WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default SupportSection;
