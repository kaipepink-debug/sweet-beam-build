import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const PLAN_LINKS = {
  mensal: "https://funnel.navenaut.com/J8vSJ",
  semestral: "https://funnel.navenaut.com/aPEco",
  anual: "https://funnel.navenaut.com/N8Jzj",
};

interface PlansPopupProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export default function PlansPopup({ open, onClose, title = "Renove sua Assinatura", description }: PlansPopupProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(0, 0, 0, 0.15)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg rounded-2xl overflow-hidden"
            style={{
              background: "rgba(12, 12, 12, 0.92)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 80px rgba(180,0,255,0.08)",
              backdropFilter: "blur(40px)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: "linear-gradient(90deg, transparent, rgba(180,0,255,0.6), transparent)" }}
            />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full transition-all hover:scale-110"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.4)" }} />
            </button>

            <div className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-lg font-bold" style={{ color: "rgba(255,255,255,0.9)" }}>{title}</h2>
                {description && (
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>{description}</p>
                )}
              </div>

              <div className="space-y-3">
                {/* Mensal */}
                <a
                  href={PLAN_LINKS.mensal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl p-4 transition-all hover:scale-[1.02]"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>Plano Mensal</h3>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Acesso completo a +300 ferramentas</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black" style={{ color: "rgba(255,255,255,0.9)" }}>R$ 67</span>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>/mês</span>
                    </div>
                  </div>
                </a>

                {/* Semestral */}
                <a
                  href={PLAN_LINKS.semestral}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl p-4 transition-all hover:scale-[1.02]"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>Plano Semestral</h3>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Ferramentas + Cursos + Comunidade</p>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: "rgba(34,197,94,0.1)", color: "rgba(34,197,94,0.9)", border: "1px solid rgba(34,197,94,0.2)" }}>30% OFF</span>
                      <div>
                        <span className="text-lg font-black" style={{ color: "rgba(255,255,255,0.9)" }}>R$ 297</span>
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>/sem</span>
                      </div>
                    </div>
                  </div>
                </a>

                {/* Anual */}
                <a
                  href={PLAN_LINKS.anual}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block rounded-xl p-4 transition-all hover:scale-[1.02] overflow-hidden"
                  style={{ background: "rgba(180,0,255,0.08)", border: "1px solid rgba(180,0,255,0.25)" }}
                >
                  <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: "linear-gradient(90deg, transparent, rgba(180,0,255,0.5), transparent)" }} />
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold mb-0.5" style={{ color: "rgba(255,255,255,0.9)" }}>Plano Anual</h3>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: "rgba(180,0,255,0.15)", color: "rgba(180,0,255,0.9)", border: "1px solid rgba(180,0,255,0.25)" }}>Mais Escolhido</span>
                      </div>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Tudo incluído + Mentorias + Garantia R$ 10k</p>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: "rgba(180,0,255,0.15)", color: "rgba(180,0,255,0.9)", border: "1px solid rgba(180,0,255,0.25)" }}>40% OFF</span>
                      <div>
                        <span className="text-lg font-black" style={{ color: "rgba(255,255,255,0.95)" }}>R$ 497</span>
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>/ano</span>
                      </div>
                    </div>
                  </div>
                </a>
              </div>

              <div className="rounded-lg p-3 text-center" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
                <p className="text-[11px] leading-relaxed" style={{ color: "rgba(34,197,94,0.8)" }}>
                  ✨ Após a compra, seu acesso é liberado <strong>automaticamente</strong>. Basta voltar e inserir o mesmo e-mail.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
