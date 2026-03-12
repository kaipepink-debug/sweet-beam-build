import NeuralBackground from "@/components/sales/NeuralBackground";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Cursos() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen">
      <NeuralBackground />
      <div className="relative z-10">
        <div className="max-w-5xl mx-auto px-4 pt-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Cursos</h1>
          <p className="text-white/60 text-lg">Em breve novos cursos disponíveis.</p>
        </div>
      </div>
    </div>
  );
}
