import { useState } from "react";
import { motion } from "framer-motion";
import NeuralBackground from "@/components/sales/NeuralBackground";
import ratariaLogo from "@/assets/rataria-logo-full.png";

const Usuario = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: "#000000" }}>
      <NeuralBackground />

      <div className="fixed inset-0 z-[1] pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(180, 0, 255, 0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(140, 0, 200, 0.03) 0%, transparent 50%)" }} />

      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-[120px]" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.15), transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 blur-[100px]" style={{ background: "radial-gradient(circle, rgba(200,200,200,0.1), transparent)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[340px] md:max-w-md mx-4"
      >
        <div
          className="relative rounded-2xl p-6 md:p-10"
          style={{
            background: "rgba(10, 10, 10, 0.8)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 0 60px rgba(0, 0, 0, 0.4), 0 25px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <img src={ratariaLogo} alt="ratarIA" className="h-20 md:h-20 w-auto rounded-lg" style={{ filter: "brightness(1.1)" }} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1
              className="text-xl font-light tracking-[0.2em] uppercase mb-2"
              style={{ color: "rgba(255, 255, 255, 0.9)", fontFamily: "'Inter', sans-serif" }}
            >
              Área do Usuário
            </h1>
            <p
              className="text-xs tracking-[0.3em] uppercase"
              style={{ color: "rgba(180, 180, 180, 0.5)" }}
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
              <label
                className="block text-xs uppercase tracking-widest mb-2 font-medium"
                style={{ color: "rgba(200, 200, 200, 0.6)" }}
              >
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
                  background: "rgba(15, 15, 15, 0.8)",
                  border: focusedField === "email"
                    ? "1px solid rgba(255, 255, 255, 0.25)"
                    : "1px solid rgba(255, 255, 255, 0.08)",
                  color: "rgba(255, 255, 255, 0.9)",
                  boxShadow: focusedField === "email"
                    ? "0 0 20px rgba(255, 255, 255, 0.05), inset 0 0 20px rgba(255, 255, 255, 0.02)"
                    : "none",
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
              <label
                className="block text-xs uppercase tracking-widest mb-2 font-medium"
                style={{ color: "rgba(200, 200, 200, 0.6)" }}
              >
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
                  background: "rgba(15, 15, 15, 0.8)",
                  border: focusedField === "password"
                    ? "1px solid rgba(255, 255, 255, 0.25)"
                    : "1px solid rgba(255, 255, 255, 0.08)",
                  color: "rgba(255, 255, 255, 0.9)",
                  boxShadow: focusedField === "password"
                    ? "0 0 20px rgba(255, 255, 255, 0.05), inset 0 0 20px rgba(255, 255, 255, 0.02)"
                    : "none",
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
                className="neon-border-btn relative w-full py-3.5 rounded-xl text-sm font-medium uppercase tracking-[0.15em] transition-all duration-500 overflow-hidden disabled:opacity-70"
                style={{ background: "transparent" }}
              >
                <span className="neon-trail" style={{ borderRadius: "0.75rem" }} />
                <span className="relative z-10 flex items-center justify-center gap-2" style={{ color: "rgba(255, 255, 255, 0.95)" }}>
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 rounded-full"
                      style={{
                        borderColor: "rgba(255,255,255,0.2)",
                        borderTopColor: "rgba(255,255,255,0.9)",
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
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Usuario;
