import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import ratariaIcon from "@/assets/rataria-icon.png";

export default function CanalAvisoButton() {
  return (
    <motion.a
      href="https://chat.whatsapp.com/Jqr0RcGIzQ6G91vbLyunDo"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="block w-full rounded-2xl px-4 md:px-5 py-4 md:py-5 transition-all duration-200"
      style={{
        background: "linear-gradient(135deg, rgba(37, 211, 102, 0.12), rgba(37, 211, 102, 0.04))",
        border: "1px solid rgba(37, 211, 102, 0.25)",
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
          style={{ background: "rgba(37, 211, 102, 0.15)" }}
        >
          <img src={ratariaIcon} alt="@rataria.io" className="w-8 h-8 md:w-9 md:h-9 object-contain" />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <p className="text-sm md:text-base font-bold" style={{ color: "rgba(37, 211, 102, 0.95)" }}>
              Canal de Avisos
            </p>
            <span
              className="px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider animate-pulse"
              style={{
                background: "rgba(239, 68, 68, 0.2)",
                color: "rgba(248, 113, 113, 0.95)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
              }}
            >
              Obrigatório
            </span>
          </div>
          <p className="text-[11px] md:text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
            Entre no canal <strong style={{ color: "rgba(255,255,255,0.7)" }}>@rataria.io</strong> no WhatsApp
          </p>
          <p className="text-[10px] md:text-xs mt-1.5" style={{ color: "rgba(248, 113, 113, 0.8)" }}>
            Todos os problemas e soluções das ferramentas serão atualizados por lá
          </p>
        </div>
        <ChevronRight className="w-5 h-5" style={{ color: "rgba(37, 211, 102, 0.5)" }} />
      </div>
    </motion.a>
  );
}
