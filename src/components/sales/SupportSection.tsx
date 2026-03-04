import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

const SupportSection = () => {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-xl mx-auto text-center">
        <motion.div
          className="relative rounded-2xl border border-white/8 p-10 overflow-hidden"
          style={{ background: "rgba(10, 10, 10, 0.8)", backdropFilter: "blur(40px)" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0" style={{ background: "radial-gradient(circle at top right, rgba(255,255,255,0.02), transparent)" }} />

          <MessageCircle className="w-10 h-10 text-white/30 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Estamos aqui para ajudá-lo</h2>
          <p className="text-white/30 text-sm mb-8 max-w-sm mx-auto">
            Fale com nossa equipe especializada e tire todas as suas dúvidas em tempo real.
          </p>

          <a
            href="https://wa.me/5500000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-white/90 transition-all hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, rgba(60, 60, 60, 1), rgba(40, 40, 40, 1))",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
            }}
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
