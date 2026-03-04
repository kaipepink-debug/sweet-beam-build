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
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl"
    >
      <div
        className={`flex items-center justify-between px-6 py-3 rounded-full border transition-all duration-300 ${
          scrolled
            ? "bg-black/80 backdrop-blur-xl border-white/10 shadow-lg shadow-black/30"
            : "bg-white/[0.03] backdrop-blur-md border-white/[0.06]"
        }`}
      >
        {/* Logo */}
        <img src={ratariaIcon} alt="ratarIA" className="h-8 w-8 opacity-70" />

        {/* Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleClick(link.href)}
              className="text-sm text-white/50 hover:text-white/90 transition-colors font-medium"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <a
          href="/login"
          className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, rgba(0, 180, 220, 0.9), rgba(0, 140, 255, 0.9))",
            boxShadow: "0 0 20px rgba(0, 180, 220, 0.3)",
          }}
        >
          Entrar
        </a>
      </div>
    </motion.nav>
  );
};

export default Navbar;
