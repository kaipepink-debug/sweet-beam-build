import { useState } from "react";
import { Star, ArrowRight } from "lucide-react";

import chatgptLogo from "@/assets/tools/chatgpt.png";
import midjourneyLogo from "@/assets/tools/midjourney.png";
import elevenlabsLogo from "@/assets/tools/elevenlabs.png";
import canvaLogo from "@/assets/tools/canva.png";
import copyaiLogo from "@/assets/tools/copyai.png";
import runwaymlLogo from "@/assets/tools/runwayml.png";
import jasperaiLogo from "@/assets/tools/jasperai.png";
import synthesiaLogo from "@/assets/tools/synthesia.png";
import higgsFieldLogo from "@/assets/tools/higgsfield.png";
import soraLogo from "@/assets/tools/sora.png";
import veo3Logo from "@/assets/tools/veo3.png";
import hailuoLogo from "@/assets/tools/hailuo.png";
import grokLogo from "@/assets/tools/grok.png";
import claudeLogo from "@/assets/tools/claude.png";
import freepikLogo from "@/assets/tools/freepik.png";
import heygenLogo from "@/assets/tools/heygen.png";

const tools = [
  { name: "ChatGPT", desc: "Assistente de IA conversacional mais avançado do mundo.", rating: 4.9, logo: chatgptLogo },
  { name: "Midjourney", desc: "Geração de imagens artísticas com qualidade profissional.", rating: 4.9, logo: midjourneyLogo },
  { name: "ElevenLabs", desc: "Síntese de voz ultra-realista com clonagem de voz.", rating: 4.8, logo: elevenlabsLogo },
  { name: "Runway ML", desc: "Edição de vídeo com IA generativa de última geração.", rating: 4.9, logo: runwaymlLogo },
  { name: "Canva Pro", desc: "Design gráfico intuitivo com recursos premium de IA.", rating: 4.9, logo: canvaLogo },
  { name: "Copy.AI", desc: "Copywriting automatizado para marketing e vendas.", rating: 4.8, logo: copyaiLogo },
  { name: "Jasper AI", desc: "Criação de conteúdo otimizado para SEO e conversão.", rating: 4.8, logo: jasperaiLogo },
  { name: "Synthesia", desc: "Criação de vídeos com avatares de IA realistas.", rating: 4.9, logo: synthesiaLogo },
  { name: "Higgsfield Creator", desc: "Geração de vídeos curtos com IA de alta qualidade.", rating: 4.7, logo: higgsFieldLogo },
  { name: "Sora", desc: "Geração de vídeos realistas a partir de texto.", rating: 4.9, logo: soraLogo },
  { name: "Veo 3", desc: "IA de vídeo do Google com qualidade cinematográfica.", rating: 4.8, logo: veo3Logo },
  { name: "Hailuo", desc: "Criação de vídeos com IA generativa inovadora.", rating: 4.8, logo: hailuoLogo },
  { name: "SuperGrok", desc: "IA conversacional avançada com acesso em tempo real.", rating: 4.9, logo: grokLogo },
  { name: "Claude", desc: "Assistente de IA seguro e confiável da Anthropic.", rating: 4.9, logo: claudeLogo },
  { name: "Freepik", desc: "Banco de imagens e design com geração por IA.", rating: 4.8, logo: freepikLogo },
  { name: "Heygen", desc: "Criação de vídeos com avatares e tradução por IA.", rating: 4.8, logo: heygenLogo },
];

const ToolsSection = () => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section id="ferramentas" className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ferramentas{" "}
            <span className="relative inline-block neon-underline-text">
              Premium
              <span className="neon-trail" />
            </span>
          </h2>
          <p className="text-white/30 max-w-xl mx-auto">
            Acesse as ferramentas de IA mais poderosas do mercado, todas incluídas no seu plano.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className={`group flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer sm:cursor-default purple-hover-glow ${
                selected === tool.name ? "border-white/15" : "border-white/5 hover:border-white/10"
              }`}
              style={{ background: selected === tool.name ? "rgba(15, 15, 15, 0.85)" : "rgba(10, 10, 10, 0.7)", backdropFilter: "blur(12px)" }}
              onClick={() => setSelected(selected === tool.name ? null : tool.name)}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                style={{ background: "rgba(180, 0, 255, 0.05)", border: "1px solid rgba(180, 0, 255, 0.1)" }}
              >
                <img src={tool.logo} alt={tool.name} className="w-8 h-8 object-contain" loading="lazy" decoding="async" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white/85 font-semibold text-sm">{tool.name}</h3>
                  <div className="flex gap-0.5 items-center">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        className="w-3 h-3"
                        style={{
                          color: s < Math.floor(tool.rating) ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.1)",
                          fill: s < Math.floor(tool.rating) ? "rgba(255,255,255,0.45)" : "transparent",
                        }}
                      />
                    ))}
                    <span className="text-white/30 text-[10px] ml-1">{tool.rating}</span>
                  </div>
                </div>
                <p className={`text-white/30 text-xs leading-relaxed ${
                  selected === tool.name ? "whitespace-normal" : "truncate"
                }`}>{tool.desc}</p>
              </div>
              <div className="shrink-0">
                <span
                  className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wide"
                  style={{
                    background: "rgba(34, 197, 94, 0.1)",
                    color: "rgba(34, 197, 94, 0.9)",
                    border: "1px solid rgba(34, 197, 94, 0.2)",
                  }}
                >
                  Ativa
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* +150 ferramentas banner */}
        <div
          className="mt-10 rounded-2xl p-8 text-center relative overflow-hidden"
          style={{
            background: "rgba(10, 10, 10, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="relative z-10">
            <div className="mb-4">
              <span className="text-4xl md:text-5xl font-light tracking-tight text-white/40">+150</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white/90 mb-2">
              Ferramentas de IA Inclusas
            </h3>
            <p className="text-white/35 max-w-lg mx-auto text-sm leading-relaxed mb-6">
              Nosso catálogo conta com mais de 150 ferramentas de inteligência artificial nas áreas de texto, imagem, vídeo, áudio, código e muito mais — todas disponíveis no seu plano.
            </p>
            <a
              href="#planos"
              className="neon-border-btn relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white/80 overflow-hidden transition-all duration-300 hover:gap-3"
              style={{ border: "1px solid rgba(255,255,255,0.15)", background: "transparent" }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Ver todos os planos
                <ArrowRight className="w-4 h-4" />
              </span>
              <span className="neon-trail" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
