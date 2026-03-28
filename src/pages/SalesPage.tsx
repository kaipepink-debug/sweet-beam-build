import { lazy, Suspense, useEffect } from "react";
import instagramIcon from "@/assets/instagram-icon.png";
import NeuralBackground from "@/components/sales/NeuralBackground";
import Navbar from "@/components/sales/Navbar";
import HeroSection from "@/components/sales/HeroSection";
import { captureUtmParams } from "@/lib/utm";
import PixelScripts from "@/components/sales/PixelScripts";

// Lazy load below-fold sections
const PainSection = lazy(() => import("@/components/sales/PainSection"));
const BenefitsSection = lazy(() => import("@/components/sales/BenefitsSection"));
const ToolsSection = lazy(() => import("@/components/sales/ToolsSection"));
const PlansSection = lazy(() => import("@/components/sales/PlansSection"));
const HowItWorksSection = lazy(() => import("@/components/sales/HowItWorksSection"));
const FAQSection = lazy(() => import("@/components/sales/FAQSection"));

const SectionFallback = () => <div className="min-h-[200px]" />;

const SalesPage = () => {
  useEffect(() => { captureUtmParams(); }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "#000000" }}>
      <NeuralBackground />
      {/* Gradient overlay */}
      <div className="fixed inset-0 z-[1] pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(180, 0, 255, 0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(140, 0, 200, 0.03) 0%, transparent 50%)" }} />
      <Navbar />
      <div className="relative z-10">
        <HeroSection />
        <Suspense fallback={<SectionFallback />}>
          <PainSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <BenefitsSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <ToolsSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <PlansSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <HowItWorksSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <FAQSection />
        </Suspense>
        <footer className="py-10 px-4 text-center">
          <a
            href="https://www.instagram.com/rataria.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mb-4 opacity-50 hover:opacity-80 transition-opacity"
          >
            <img src={instagramIcon} alt="Instagram" className="w-5 h-5 invert brightness-75 mx-auto" loading="lazy" />
          </a>
          <p className="text-white/15 text-xs mb-3">
            © 2026 ratarIA. Todos os direitos reservados.
          </p>
          <div className="flex items-center justify-center gap-4 text-white/15 text-[11px]">
            <a href="#" className="hover:text-white/30 transition-colors">Termos de Uso</a>
            <span>·</span>
            <a href="#" className="hover:text-white/30 transition-colors">Política de Privacidade</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SalesPage;
