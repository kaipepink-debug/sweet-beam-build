import NeuralBackground from "@/components/sales/NeuralBackground";
import HeroSection from "@/components/sales/HeroSection";
import PainSection from "@/components/sales/PainSection";
import BenefitsSection from "@/components/sales/BenefitsSection";
import ToolsSection from "@/components/sales/ToolsSection";
import PlansSection from "@/components/sales/PlansSection";
import HowItWorksSection from "@/components/sales/HowItWorksSection";
import FAQSection from "@/components/sales/FAQSection";
import SupportSection from "@/components/sales/SupportSection";

const SalesPage = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "#000000" }}>
      <NeuralBackground />
      <div className="relative z-10">
        <HeroSection />
        <PainSection />
        <BenefitsSection />
        <ToolsSection />
        <PlansSection />
        <HowItWorksSection />
        <FAQSection />
        <SupportSection />
        <footer className="py-8 text-center text-white/15 text-xs border-t border-white/5">
          © 2026 IA Premium. Todos os direitos reservados.
        </footer>
      </div>
    </div>
  );
};

export default SalesPage;
