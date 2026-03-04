import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ratariaLogo from "@/assets/rataria-logo.jpeg";

// Neural network background canvas
const NeuralBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
    let codeLines: { y: number; x: number; speed: number; text: string; opacity: number }[] = [];

    const codeSnippets = [
      "const model = await tf.loadModel()",
      "neural.forward(input_tensor)",
      "loss = criterion(output, target)",
      "optimizer.step()",
      "pred = model.predict(X_test)",
      "embedding = encoder(tokens)",
      "attention = softmax(Q @ K.T)",
      "gradient = backward(loss)",
      "weights = layer.parameters()",
      "batch = DataLoader(dataset)",
      "transform = normalize(data)",
      "accuracy = evaluate(model)",
    ];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const init = () => {
      resize();
      particles = Array.from({ length: 80 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
      }));
      codeLines = Array.from({ length: 12 }, () => ({
        y: Math.random() * canvas.height,
        x: Math.random() * canvas.width,
        speed: Math.random() * 0.3 + 0.1,
        text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
        opacity: Math.random() * 0.12 + 0.03,
      }));
    };

    const draw = () => {
      ctx.fillStyle = "rgba(5, 5, 15, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw code lines flowing
      codeLines.forEach((line) => {
        ctx.font = "13px 'JetBrains Mono', monospace";
        ctx.fillStyle = `rgba(100, 140, 255, ${line.opacity})`;
        ctx.fillText(line.text, line.x, line.y);
        line.y += line.speed;
        if (line.y > canvas.height + 20) {
          line.y = -20;
          line.x = Math.random() * canvas.width;
          line.text = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
        }
      });

      // Draw particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(120, 130, 255, 0.6)`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        g.addColorStop(0, "rgba(100, 120, 255, 0.15)");
        g.addColorStop(1, "rgba(100, 120, 255, 0)");
        ctx.fillStyle = g;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      // Draw connections (neural network lines)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(100, 120, 255, ${0.08 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    init();
    // Clear canvas fully first
    ctx.fillStyle = "#05050f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    draw();

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate loading
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: "#05050f" }}>
      <NeuralBackground />

      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-[120px]" style={{ background: "radial-gradient(circle, rgba(80,100,255,0.4), transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-[100px]" style={{ background: "radial-gradient(circle, rgba(140,80,255,0.3), transparent)" }} />
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div
          className="relative rounded-2xl p-8 md:p-10"
          style={{
            background: "rgba(15, 15, 30, 0.7)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: "1px solid rgba(100, 120, 255, 0.15)",
            boxShadow: "0 0 60px rgba(80, 100, 255, 0.08), 0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <img
              src={ratariaLogo}
              alt="ratarIA"
              className="h-14 w-auto rounded-lg"
              style={{ filter: "brightness(1.1)" }}
            />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1
              className="text-xl font-light tracking-[0.2em] uppercase mb-2"
              style={{ color: "rgba(220, 225, 255, 0.95)", fontFamily: "'Inter', sans-serif" }}
            >
              Painel Administrativo
            </h1>
            <p
              className="text-xs tracking-[0.3em] uppercase"
              style={{ color: "rgba(140, 150, 200, 0.6)" }}
            >
              Acesso restrito
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <label
                className="block text-xs uppercase tracking-widest mb-2 font-medium"
                style={{ color: "rgba(160, 170, 220, 0.7)" }}
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
                  background: "rgba(20, 20, 45, 0.6)",
                  border: focusedField === "email"
                    ? "1px solid rgba(100, 130, 255, 0.5)"
                    : "1px solid rgba(80, 90, 140, 0.2)",
                  color: "rgba(220, 225, 255, 0.9)",
                  boxShadow: focusedField === "email"
                    ? "0 0 20px rgba(80, 100, 255, 0.15), inset 0 0 20px rgba(80, 100, 255, 0.05)"
                    : "none",
                }}
                placeholder="admin@rataria.com"
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
                style={{ color: "rgba(160, 170, 220, 0.7)" }}
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
                  background: "rgba(20, 20, 45, 0.6)",
                  border: focusedField === "password"
                    ? "1px solid rgba(100, 130, 255, 0.5)"
                    : "1px solid rgba(80, 90, 140, 0.2)",
                  color: "rgba(220, 225, 255, 0.9)",
                  boxShadow: focusedField === "password"
                    ? "0 0 20px rgba(80, 100, 255, 0.15), inset 0 0 20px rgba(80, 100, 255, 0.05)"
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
                className="relative w-full py-3.5 rounded-xl text-sm font-medium uppercase tracking-[0.15em] transition-all duration-500 overflow-hidden group disabled:opacity-70"
                style={{
                  background: "linear-gradient(135deg, rgba(70, 90, 255, 0.9), rgba(130, 80, 255, 0.9))",
                  color: "rgba(255, 255, 255, 0.95)",
                  boxShadow: "0 4px 20px rgba(80, 100, 255, 0.3)",
                }}
              >
                {/* Hover glow overlay */}
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: "linear-gradient(135deg, rgba(90, 110, 255, 1), rgba(150, 100, 255, 1))",
                    boxShadow: "0 6px 30px rgba(80, 100, 255, 0.5)",
                  }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
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

          {/* Bottom accent line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 h-px mx-auto w-24 origin-center"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(100, 120, 255, 0.4), transparent)",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
