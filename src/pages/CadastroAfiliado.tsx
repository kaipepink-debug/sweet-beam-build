import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import NeuralBackground from "@/components/sales/NeuralBackground";
import ratariaLogo from "@/assets/rataria-logo-full.png";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CadastroAfiliado = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    const ddd = digits.slice(0, 2);
    const rest = digits.slice(2);
    if (digits.length <= 2) return digits.length ? `(${ddd}` : "";
    if (rest.length <= 4) return `(${ddd}) ${rest}`;
    if (rest.length <= 8) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
    return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10 && phoneDigits.length !== 11) {
      toast({ title: "Telefone inválido", description: "Use (xx) xxxx-xxxx ou (xx) xxxxx-xxxx.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Senha muito curta", description: "Use pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: nome, phone, is_afiliado: "true" },
      },
    });
    if (error) {
      setLoading(false);
      toast({ title: "Erro ao cadastrar", description: error.message, variant: "destructive" });
      return;
    }
    // Try sign in (auto-confirm enabled)
    await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    toast({ title: "Conta criada!", description: "Bem-vindo ao painel de afiliados." });
    navigate("/dashboard/assinaturas");
  };

  const inputStyle = (field: string) => ({
    background: "rgba(15, 15, 15, 0.8)",
    border: focused === field ? "1px solid rgba(255, 255, 255, 0.25)" : "1px solid rgba(255, 255, 255, 0.08)",
    color: "rgba(255, 255, 255, 0.9)",
    boxShadow: focused === field ? "0 0 20px rgba(255,255,255,0.05), inset 0 0 20px rgba(255,255,255,0.02)" : "none",
  });

  return (
    <div className="desktop-zoom relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: "#000000" }}>
      <NeuralBackground />
      <div className="fixed inset-0 z-[1] pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(180,0,255,0.04) 0%, transparent 60%)" }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[340px] md:max-w-md mx-4 my-8"
      >
        <div
          className="relative rounded-2xl p-6 md:p-10"
          style={{
            background: "rgba(10,10,10,0.8)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 0 60px rgba(0,0,0,0.4), 0 25px 50px rgba(0,0,0,0.6)",
          }}
        >
          <div className="flex justify-center mb-6">
            <img src={ratariaLogo} alt="ratarIA" className="h-16 w-auto rounded-lg" style={{ filter: "brightness(1.1)" }} />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-lg font-light tracking-[0.2em] uppercase mb-1" style={{ color: "rgba(255,255,255,0.9)" }}>
              Cadastro de Afiliado
            </h1>
            <p className="text-xs tracking-[0.3em] uppercase" style={{ color: "rgba(180,180,180,0.5)" }}>
              Crie sua conta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: "rgba(200,200,200,0.6)" }}>Nome</label>
              <input
                type="text" value={nome} onChange={(e) => setNome(e.target.value)}
                onFocus={() => setFocused("nome")} onBlur={() => setFocused(null)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={inputStyle("nome")} placeholder="Seu nome completo" required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: "rgba(200,200,200,0.6)" }}>E-mail</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={inputStyle("email")} placeholder="seu@email.com" required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: "rgba(200,200,200,0.6)" }}>Telefone</label>
              <input
                type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))}
                onFocus={() => setFocused("phone")} onBlur={() => setFocused(null)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={inputStyle("phone")} placeholder="(00) 00000-0000" required maxLength={15}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: "rgba(200,200,200,0.6)" }}>Senha</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={inputStyle("password")} placeholder="••••••••••" required minLength={6}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit" disabled={loading}
                className="neon-border-btn relative w-full py-3.5 rounded-xl text-sm font-medium uppercase tracking-[0.15em] transition-all overflow-hidden disabled:opacity-70"
                style={{ background: "transparent" }}
              >
                <span className="neon-trail" style={{ borderRadius: "0.75rem" }} />
                <span className="relative z-10 flex items-center justify-center gap-2" style={{ color: "rgba(255,255,255,0.95)" }}>
                  {loading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 rounded-full"
                      style={{ borderColor: "rgba(255,255,255,0.2)", borderTopColor: "rgba(255,255,255,0.9)" }}
                    />
                  ) : "Criar Conta"}
                </span>
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-xs uppercase tracking-widest hover:text-white transition-colors" style={{ color: "rgba(180,180,180,0.6)" }}>
              Já tem conta? Entrar
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CadastroAfiliado;
