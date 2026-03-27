import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, XCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import NeuralBackground from "@/components/sales/NeuralBackground";
import ratariaLogo from "@/assets/rataria-logo-full.png";

type PopupType = "expired" | "no_subscription" | null;

interface PopupData {
  name?: string;
  productName?: string;
  expiresAt?: string;
}

const PLAN_LINKS = {
  mensal: "https://funnel.navenaut.com/J8vSJ",
  semestral: "https://checkout.navenaut.com/KXAsP?fid=019d1de8-2820-73fc-b229-f0ebc4a9c79b&funnel=N8Jzj&offer=semestral",
  anual: "https://checkout.navenaut.com/KXAsP?fid=019d1de8-6f17-7561-b16a-6dc9b3e3dbbe&funnel=aPEco&offer=anual",
};

const Usuario = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const [popup, setPopup] = useState<PopupType>(null);
  const [popupData, setPopupData] = useState<PopupData>({});

  // Auto-redirect if already has active session
  useEffect(() => {
    const stored = localStorage.getItem("naut_subscription");
    if (stored) {
      const redirectTo = searchParams.get("redirect") || "/painel";
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        body: { email: email.trim() },
      });

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível verificar sua assinatura. Tente novamente.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // No subscription found at all
      if (!data?.success || !data?.data?.subscriptions?.length) {
        setPopupData({ name: data?.data?.name });
        setPopup("no_subscription");
        setLoading(false);
        return;
      }

      // Check if any subscription is active
      const activeSub = data.data.subscriptions.find((s: any) => s.isActive);
      
      if (!activeSub) {
        // All subscriptions expired
        const lastSub = data.data.subscriptions[0];
        setPopupData({
          name: data.data.name,
          productName: lastSub.productName,
          expiresAt: lastSub.expiresAt,
        });
        setPopup("expired");
        setLoading(false);
        return;
      }

      // Check if active subscription is actually expired by date
      const expiresAt = new Date(activeSub.expiresAt);
      if (expiresAt < new Date()) {
        setPopupData({
          name: data.data.name,
          productName: activeSub.productName,
          expiresAt: activeSub.expiresAt,
        });
        setPopup("expired");
        setLoading(false);
        return;
      }

      // Active subscription - grant access
      const subscriptionInfo = {
        email: data.data.email,
        name: data.data.name,
        subscriptions: data.data.subscriptions,
      };
      localStorage.setItem("naut_subscription", JSON.stringify(subscriptionInfo));

      toast({
        title: "Bem-vindo!",
        description: `Acesso liberado, ${data.data.name || "usuário"}!`,
      });

      navigate("/painel");
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro ao conectar com o servidor. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const theme = {
    cardBg: "rgba(10, 10, 10, 0.8)",
    cardBorder: "rgba(255, 255, 255, 0.08)",
    cardShadow: "0 0 60px rgba(0, 0, 0, 0.4), 0 25px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)",
    title: "rgba(255, 255, 255, 0.9)",
    subtitle: "rgba(180, 180, 180, 0.5)",
    label: "rgba(200, 200, 200, 0.6)",
    inputBg: "rgba(15, 15, 15, 0.8)",
    inputBorder: "rgba(255, 255, 255, 0.08)",
    inputBorderFocus: "rgba(255, 255, 255, 0.25)",
    inputText: "rgba(255, 255, 255, 0.9)",
    inputShadowFocus: "0 0 20px rgba(255, 255, 255, 0.05), inset 0 0 20px rgba(255, 255, 255, 0.02)",
    btnText: "rgba(255, 255, 255, 0.95)",
    btnSpinnerBorder: "rgba(255,255,255,0.2)",
    btnSpinnerTop: "rgba(255,255,255,0.9)",
    accent: "rgba(255, 255, 255, 0.15)",
    logoFilter: "brightness(1.1)",
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <NeuralBackground variant="dark" />

      {/* Overlay glows */}
      <div className="fixed inset-0 z-[1] pointer-events-none" style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(180, 0, 255, 0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(140, 0, 200, 0.03) 0%, transparent 50%)"
      }} />
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-[120px]" style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.15), transparent)"
        }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 blur-[100px]" style={{
          background: "radial-gradient(circle, rgba(200,200,200,0.1), transparent)"
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[340px] md:max-w-md mx-4"
      >
        <div
          className="relative rounded-2xl p-6 md:p-10 transition-all duration-700"
          style={{
            background: theme.cardBg,
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: `1px solid ${theme.cardBorder}`,
            boxShadow: theme.cardShadow,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <img src={ratariaLogo} alt="ratarIA" className="h-24 md:h-28 w-auto rounded-lg transition-all duration-500" style={{ filter: theme.logoFilter }} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1
              className="text-xl font-bold tracking-[0.2em] uppercase mb-2 transition-colors duration-500"
              style={{ color: theme.title, fontFamily: "'Inter', sans-serif" }}
            >
              Área do Usuário
            </h1>
            <p
              className="text-xs font-semibold tracking-[0.3em] uppercase transition-colors duration-500"
              style={{ color: theme.subtitle }}
            >
              Informe seu e-mail de compra
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <label className="block text-xs uppercase tracking-widest mb-2 font-medium transition-colors duration-500" style={{ color: theme.label }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                className="w-full px-4 py-3 rounded-xl text-base outline-none transition-all duration-500"
                style={{
                  background: theme.inputBg,
                  border: focusedField === "email" ? `1px solid ${theme.inputBorderFocus}` : `1px solid ${theme.inputBorder}`,
                  color: theme.inputText,
                  boxShadow: focusedField === "email" ? theme.inputShadowFocus : "none",
                }}
                placeholder="seu@email.com"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="pt-2"
            >
              <button
                type="submit"
                disabled={loading}
                className="relative w-full py-3.5 rounded-xl text-sm font-medium uppercase tracking-[0.15em] transition-all duration-500 overflow-hidden disabled:opacity-70 neon-border-btn"
                style={{
                  background: "transparent",
                  border: undefined,
                  boxShadow: undefined,
                }}
              >
                <span className="neon-trail" style={{ borderRadius: "0.75rem" }} />
                <span className="relative z-10 flex items-center justify-center gap-2 transition-colors duration-500" style={{ color: theme.btnText }}>
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 rounded-full"
                      style={{
                        borderColor: theme.btnSpinnerBorder,
                        borderTopColor: theme.btnSpinnerTop,
                      }}
                    />
                  ) : (
                    "Acessar"
                  )}
                </span>
              </button>
            </motion.div>
          </form>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 h-px mx-auto w-24 origin-center"
            style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }}
          />
        </div>
      </motion.div>

      {/* Subscription Popups */}
      <AnimatePresence>
        {popup && (
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
            onClick={() => setPopup(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg rounded-2xl overflow-hidden"
              style={{
                background: "rgba(12, 12, 12, 0.92)",
                border: `1px solid ${"rgba(255,255,255,0.08)"}`,
                boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 80px rgba(180,0,255,0.08)",
                backdropFilter: "blur(40px)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top gradient line */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{
                  background: popup === "expired"
                    ? "linear-gradient(90deg, transparent, rgba(239,68,68,0.6), transparent)"
                    : "linear-gradient(90deg, transparent, rgba(180,0,255,0.6), transparent)",
                }}
              />

              <button
                onClick={() => setPopup(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full transition-all hover:scale-110"
                style={{
                  background: "rgba(255,255,255,0.06)",
                }}
              >
                <X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.4)" }} />
              </button>

              {popup === "expired" ? (
                <div className="p-8 text-center space-y-5">
                  <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(239, 68, 68, 0.12)" }}>
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold mb-2" style={{ color: "rgba(255,255,255,0.9)" }}>
                      Assinatura Expirada
                    </h2>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {popupData.name ? `Olá, ${popupData.name}! ` : ""}
                      Sua assinatura{popupData.productName ? ` do ${popupData.productName}` : ""} expirou
                      {popupData.expiresAt ? ` em ${new Date(popupData.expiresAt).toLocaleDateString("pt-BR")}` : ""}.
                      Renove para continuar acessando.
                    </p>
                  </div>
                  <div className="space-y-3 pt-2">
                    <a
                      href={PLAN_LINKS.mensal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 rounded-xl text-sm font-semibold uppercase tracking-widest text-center transition-all hover:scale-[1.02]"
                      style={{
                        background: "linear-gradient(135deg, rgba(180,0,255,0.5), rgba(120,0,200,0.4))",
                        border: "1px solid rgba(180,0,255,0.3)",
                        color: "white",
                        boxShadow: "0 4px 20px rgba(180,0,255,0.2)",
                      }}
                    >
                      Renovar Mensal — R$ 67/mês
                    </a>
                    <div className="flex gap-3">
                      <a
                        href={PLAN_LINKS.semestral}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-center transition-all hover:scale-[1.02]"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.7)",
                          border: `1px solid ${"rgba(255,255,255,0.08)"}`,
                        }}
                      >
                        Semestral — R$ 297
                      </a>
                      <a
                        href={PLAN_LINKS.anual}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-center transition-all hover:scale-[1.02]"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.7)",
                          border: `1px solid ${"rgba(255,255,255,0.08)"}`,
                        }}
                      >
                        Anual — R$ 497
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 space-y-6">
                  {/* Header */}
                  <div className="text-center space-y-3">
                    <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(180, 0, 255, 0.1)" }}>
                      <XCircle className="w-8 h-8" style={{ color: "rgba(180, 0, 255, 0.7)" }} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold mb-1" style={{ color: "rgba(255,255,255,0.9)" }}>
                        Nenhuma Assinatura Encontrada
                      </h2>
                      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                        Escolha um plano para ter acesso completo às ferramentas de IA.
                      </p>
                    </div>
                  </div>

                  {/* Plans */}
                  <div className="space-y-3">
                    {/* Mensal */}
                    <a
                      href={PLAN_LINKS.mensal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl p-4 transition-all hover:scale-[1.02] group"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${"rgba(255,255,255,0.08)"}`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>
                            Plano Mensal
                          </h3>
                          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                            Acesso completo a +300 ferramentas
                          </p>
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
                      className="block rounded-xl p-4 transition-all hover:scale-[1.02] group"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${"rgba(255,255,255,0.08)"}`,
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>
                            Plano Semestral
                          </h3>
                          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                            Ferramentas + Cursos + Comunidade
                          </p>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end gap-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: "rgba(34,197,94,0.1)", color: "rgba(34,197,94,0.9)", border: "1px solid rgba(34,197,94,0.2)" }}>
                            30% OFF
                          </span>
                          <div>
                            <span className="text-lg font-black" style={{ color: "rgba(255,255,255,0.9)" }}>R$ 297</span>
                            <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>/sem</span>
                          </div>
                        </div>
                      </div>
                    </a>

                    {/* Anual — Destaque */}
                    <a
                      href={PLAN_LINKS.anual}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative block rounded-xl p-4 transition-all hover:scale-[1.02] group overflow-hidden"
                      style={{
                        background: "rgba(180,0,255,0.08)",
                        border: "1px solid rgba(180,0,255,0.25)",
                      }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: "linear-gradient(90deg, transparent, rgba(180,0,255,0.5), transparent)" }} />
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold mb-0.5" style={{ color: "rgba(255,255,255,0.9)" }}>
                            Plano Anual
                          </h3>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: "rgba(180,0,255,0.15)", color: "rgba(180,0,255,0.9)", border: "1px solid rgba(180,0,255,0.25)" }}>
                              Mais Escolhido
                            </span>
                          </div>
                          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                            Tudo incluído + Mentorias + Garantia R$ 10k
                          </p>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end gap-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: "rgba(180,0,255,0.15)", color: "rgba(180,0,255,0.9)", border: "1px solid rgba(180,0,255,0.25)" }}>
                            40% OFF
                          </span>
                          <div>
                            <span className="text-lg font-black" style={{ color: "rgba(255,255,255,0.95)" }}>R$ 497</span>
                            <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>/ano</span>
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>

                  {/* Auto access note */}
                  <div
                    className="rounded-lg p-3 text-center"
                    style={{
                      background: "rgba(34,197,94,0.06)",
                      border: "1px solid rgba(34,197,94,0.15)",
                    }}
                  >
                    <p className="text-[11px] leading-relaxed" style={{ color: "rgba(34,197,94,0.8)" }}>
                      ✨ Após a compra, seu acesso é liberado <strong>automaticamente</strong>. Basta voltar aqui e inserir o mesmo e-mail utilizado na compra.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Usuario;
