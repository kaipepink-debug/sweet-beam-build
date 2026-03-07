import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import NeuralBackground from "@/components/sales/NeuralBackground";
import ratariaLogo from "@/assets/rataria-logo-full.png";

const Usuario = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    navigate("/painel");
  };

  const theme = isDark
    ? {
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
        toggleBg: "rgba(255, 255, 255, 0.08)",
        toggleIcon: "rgba(255, 255, 255, 0.6)",
        toggleBorder: "rgba(255,255,255,0.08)",
        logoFilter: "brightness(1.1)",
      }
    : {
        cardBg: "rgba(255, 255, 255, 0.85)",
        cardBorder: "rgba(0, 0, 0, 0.25)",
        cardShadow: "0 0 60px rgba(180, 0, 255, 0.06), 0 25px 50px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
        title: "rgba(0, 0, 0, 0.88)",
        subtitle: "rgba(100, 100, 100, 0.6)",
        label: "rgba(60, 60, 60, 0.8)",
        inputBg: "rgba(250, 248, 255, 0.9)",
        inputBorder: "rgba(180, 0, 255, 0.1)",
        inputBorderFocus: "rgba(180, 0, 255, 0.4)",
        inputText: "rgba(0, 0, 0, 0.88)",
        inputShadowFocus: "0 0 20px rgba(180, 0, 255, 0.1), inset 0 0 20px rgba(180, 0, 255, 0.03)",
        btnText: "rgba(255, 255, 255, 0.95)",
        btnSpinnerBorder: "rgba(180, 0, 255, 0.25)",
        btnSpinnerTop: "rgba(180, 0, 255, 0.9)",
        accent: "rgba(180, 0, 255, 0.2)",
        toggleBg: "rgba(0, 0, 0, 0.06)",
        toggleIcon: "rgba(60, 60, 60, 0.8)",
        toggleBorder: "rgba(0,0,0,0.1)",
        logoFilter: "brightness(0) saturate(100%)",
      };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Neural background with variant */}
      <NeuralBackground key={isDark ? "dark" : "light"} variant={isDark ? "dark" : "light"} />

      {/* Overlay glows */}
      <div className="fixed inset-0 z-[1] pointer-events-none" style={{
        background: isDark
          ? "radial-gradient(ellipse at 50% 0%, rgba(180, 0, 255, 0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(140, 0, 200, 0.03) 0%, transparent 50%)"
          : "radial-gradient(ellipse at 50% 0%, rgba(180, 0, 255, 0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(140, 0, 200, 0.04) 0%, transparent 50%)"
      }} />
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-[120px]" style={{
          background: isDark
            ? "radial-gradient(circle, rgba(255,255,255,0.15), transparent)"
            : "radial-gradient(circle, rgba(180,0,255,0.15), transparent)"
        }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 blur-[100px]" style={{
          background: isDark
            ? "radial-gradient(circle, rgba(200,200,200,0.1), transparent)"
            : "radial-gradient(circle, rgba(140,0,220,0.1), transparent)"
        }} />
      </div>

      {/* Theme toggle button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        onClick={() => setIsDark(!isDark)}
        className="fixed top-6 right-6 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 hover:scale-110"
        style={{
          background: theme.toggleBg,
          border: `1px solid ${theme.toggleBorder}`,
          backdropFilter: "blur(20px)",
        }}
        title={isDark ? "Modo claro" : "Modo escuro"}
      >
        <motion.div
          key={isDark ? "moon" : "sun"}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? (
            <Moon className="w-4 h-4" style={{ color: theme.toggleIcon }} />
          ) : (
            <Sun className="w-4 h-4" style={{ color: theme.toggleIcon }} />
          )}
        </motion.div>
      </motion.button>

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
              Acesse sua conta
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
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-500"
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
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <label className="block text-xs uppercase tracking-widest mb-2 font-medium transition-colors duration-500" style={{ color: theme.label }}>
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-500"
                style={{
                  background: theme.inputBg,
                  border: focusedField === "password" ? `1px solid ${theme.inputBorderFocus}` : `1px solid ${theme.inputBorder}`,
                  color: theme.inputText,
                  boxShadow: focusedField === "password" ? theme.inputShadowFocus : "none",
                }}
                placeholder="••••••••••"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="pt-2"
            >
              <button
                type="submit"
                disabled={loading}
                className={`relative w-full py-3.5 rounded-xl text-sm font-medium uppercase tracking-[0.15em] transition-all duration-500 overflow-hidden disabled:opacity-70 ${isDark ? "neon-border-btn" : "neon-border-btn"}`}
                style={{
                  background: isDark ? "transparent" : "rgba(50, 50, 50, 0.9)",
                  border: isDark ? undefined : "1px solid rgba(80, 80, 80, 0.5)",
                  boxShadow: isDark ? undefined : "0 0 20px rgba(180, 0, 255, 0.15)",
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
                    "Entrar"
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
    </div>
  );
};

export default Usuario;
