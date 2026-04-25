import { lazy, Suspense, useEffect } from "react";
import instagramIcon from "@/assets/instagram-icon.png";
import NeuralBackground from "@/components/sales/NeuralBackground";
import NavbarEN from "@/components/sales/en/NavbarEN";
import HeroSectionEN from "@/components/sales/en/HeroSectionEN";
import { captureUtmParams } from "@/lib/utm";
import PixelScripts from "@/components/sales/PixelScripts";

const PainSectionEN = lazy(() => import("@/components/sales/en/PainSectionEN"));
const BenefitsSectionEN = lazy(() => import("@/components/sales/en/BenefitsSectionEN"));
const ToolsSectionEN = lazy(() => import("@/components/sales/en/ToolsSectionEN"));
const PlansSectionEN = lazy(() => import("@/components/sales/en/PlansSectionEN"));
const HowItWorksSectionEN = lazy(() => import("@/components/sales/en/HowItWorksSectionEN"));
const FAQSectionEN = lazy(() => import("@/components/sales/en/FAQSectionEN"));

const SectionFallback = () => <div className="min-h-[200px]" />;

const SalesPageEN = () => {
  useEffect(() => { captureUtmParams(); }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "#000000" }}>
      <NeuralBackground />
      <div className="fixed inset-0 z-[1] pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(180, 0, 255, 0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(140, 0, 200, 0.03) 0%, transparent 50%)" }} />
      <PixelScripts />
      <NavbarEN />
      <div className="relative z-10">
        <HeroSectionEN />
        <Suspense fallback={<SectionFallback />}>
          <PainSectionEN />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <BenefitsSectionEN />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <ToolsSectionEN />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <PlansSectionEN />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <HowItWorksSectionEN />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <FAQSectionEN />
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
            © 2026 ratarIA. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-4 text-white/15 text-[11px]">
            <a href="#" className="hover:text-white/30 transition-colors">Terms of Use</a>
            <span>·</span>
            <a href="#" className="hover:text-white/30 transition-colors">Privacy Policy</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SalesPageEN;
