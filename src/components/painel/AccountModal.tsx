import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Calendar, Package, Shield, Clock, User, Mail, ArrowUpCircle } from "lucide-react";
import PlansPopup from "./PlansPopup";

interface AccountModalProps {
  open: boolean;
  onClose: () => void;
  subData: any;
  activeSub: any;
  daysRemaining: string;
  statusText: string;
}

const t = {
  bg: "rgba(21,21,24,0.98)",
  cardBg: "rgba(255,255,255,0.03)",
  cardBorder: "rgba(255,255,255,0.06)",
  label: "rgba(255,255,255,0.4)",
  value: "rgba(255,255,255,0.9)",
  title: "rgba(255,255,255,0.95)",
  divider: "rgba(255,255,255,0.06)",
};

export default function AccountModal({ open, onClose, subData, activeSub, daysRemaining, statusText }: AccountModalProps) {
  const [showPlans, setShowPlans] = useState(false);
  if (!open) return null;

  const statusColor = statusText === "Ativo" ? "34, 197, 94" : "239, 68, 68";

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("pt-BR");
    } catch {
      return "—";
    }
  };

  const planName = activeSub?.productName || activeSub?.planName || activeSub?.product || "—";
  const paymentMethod = activeSub?.paymentMethod || activeSub?.payment_method || "—";
  const price = activeSub?.price || activeSub?.amount || null;
  const purchaseDate = activeSub?.createdAt || activeSub?.created_at || activeSub?.purchasedAt || null;
  const expiresAt = activeSub?.expiresAt || activeSub?.expires_at || null;
  const email = subData?.email || "—";
  const fullName = subData?.name || "—";

  const rows = [
    { icon: User, label: "Nome completo", value: fullName },
    { icon: Mail, label: "E-mail", value: email },
    { icon: Package, label: "Plano", value: planName },
    { icon: Shield, label: "Status", value: statusText, color: statusColor },
    { icon: Clock, label: "Dias restantes", value: `${daysRemaining} dias` },
    { icon: Calendar, label: "Data da compra", value: formatDate(purchaseDate) },
    { icon: Calendar, label: "Expira em", value: formatDate(expiresAt) },
    { icon: CreditCard, label: "Método de pagamento", value: paymentMethod },
    ...(price ? [{ icon: CreditCard, label: "Valor", value: typeof price === "number" ? `R$ ${price.toFixed(2)}` : `R$ ${price}` }] : []),
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 rounded-2xl overflow-hidden"
            style={{
              background: t.bg,
              border: `1px solid ${t.cardBorder}`,
              backdropFilter: "blur(40px)",
              maxHeight: "80vh",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${t.divider}` }}>
              <h2 className="text-base font-bold" style={{ color: t.title }}>Minha Conta</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:bg-white/5">
                <X className="w-5 h-5" style={{ color: "rgba(255,255,255,0.4)" }} />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-4 space-y-1 overflow-y-auto" style={{ maxHeight: "60vh" }}>
              {rows.map((row, i) => (
                <div
                  key={row.label}
                  className="flex items-center gap-3 py-3"
                  style={{ borderBottom: i < rows.length - 1 ? `1px solid ${t.divider}` : "none" }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `rgba(${(row as any).color || "139, 92, 246"}, 0.1)` }}
                  >
                    <row.icon className="w-4 h-4" style={{ color: `rgba(${(row as any).color || "139, 92, 246"}, 0.7)` }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] uppercase tracking-wider font-medium" style={{ color: t.label }}>{row.label}</p>
                    <p className="text-sm font-semibold truncate" style={{ color: (row as any).color ? `rgba(${(row as any).color}, 0.9)` : t.value }}>
                      {row.value}
                    </p>
                  </div>
                  {row.label === "Plano" && (
                    <button
                      onClick={() => setShowPlans(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold shrink-0 transition-all duration-200 hover:scale-105"
                      style={{
                        background: "rgba(139, 92, 246, 0.12)",
                        border: "1px solid rgba(139, 92, 246, 0.2)",
                        color: "rgba(139, 92, 246, 0.9)",
                      }}
                    >
                      <ArrowUpCircle className="w-3.5 h-3.5" />
                      Upgrade
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
