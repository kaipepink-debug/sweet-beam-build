import { useNavigate } from "react-router-dom";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import ratariaLogo from "@/assets/rataria-icon.png";
import ratariaLogoBlack from "@/assets/rataria-icon-black.png";
import { useState, useEffect } from "react";

export default function UnderDevelopment() {
  const navigate = useNavigate();
  const [isLight, setIsLight] = useState(document.documentElement.classList.contains("light"));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(document.documentElement.classList.contains("light"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center">
      <img
        src={isLight ? ratariaLogoBlack : ratariaLogo}
        alt="RatarIA"
        className="h-16 object-contain"
      />
      <div className="flex items-center gap-2 text-muted-foreground">
        <Construction className="w-5 h-5" />
        <span className="text-lg font-semibold">Tela em desenvolvimento</span>
      </div>
      <p className="text-sm text-muted-foreground max-w-sm">
        Estamos trabalhando nesta funcionalidade. Em breve ela estará disponível para você.
      </p>
      <Button
        variant="outline"
        onClick={() => navigate(-1)}
        className="rounded-xl gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Button>
    </div>
  );
}
