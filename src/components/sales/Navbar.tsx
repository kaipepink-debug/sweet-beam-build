import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import ratariaIcon from "@/assets/rataria-icon.png";

const navLinks = [
  { label: "Início", href: "#hero" },
  { label: "Benefícios", href: "#beneficios" },
  { label: "Ferramentas", href: "#ferramentas" },
  { label: "Planos", href: "#planos" },
  { label: "Dúvidas", href: "#faq" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = (href: string) => {
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="fixed top-3 left-0 right-0 z-50 flex justify-center px-4">
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="w-full max-w-3xl"
      >
      <div
        className={`flex items-center justify-between px-5 py-2.5 rounded-full border transition-all duration-300 ${
          scrolled
            ? "bg-black/80 backdrop-blur-xl border-white/10 shadow-lg shadow-black/30"
            : "bg-white/[0.03] backdrop-blur-md border-white/[0.06]"
        }`}
      >
        {/* Logo */}
        <img src={ratariaIcon} alt="ratarIA" className="h-8 w-8 opacity-70" />

        {/* Links */}
        <div className="hidden md:flex items-center gap-5">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleClick(link.href)}
              className="text-xs text-white/50 hover:text-white/90 transition-colors font-medium"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <a
          href="/usuario"
          className="neon-border-btn relative px-4 py-1.5 rounded-full text-xs font-semibold text-white/80 overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.15)", background: "transparent" }}
        >
          <span className="relative z-10">Entrar</span>
          <span className="neon-trail" />
        </a>
      </div>
      </motion.nav>
    </div>
  );
};

export default Navbar;
