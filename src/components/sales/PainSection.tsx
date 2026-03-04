import { TrendingDown, Check, DollarSign, Sparkles, Zap, Shield, RefreshCw, Headphones, Infinity, MoreHorizontal } from "lucide-react";

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
  { name: "ChatGPT Plus", price: 139.90, logo: chatgptLogo },
  { name: "Midjourney", price: 60.00, logo: midjourneyLogo },
  { name: "ElevenLabs", price: 55.00, logo: elevenlabsLogo },
  { name: "Canva Pro", price: 34.90, logo: canvaLogo },
  { name: "Copy.AI", price: 49.00, logo: copyaiLogo },
  { name: "Runway ML", price: 60.00, logo: runwaymlLogo },
  { name: "Jasper AI", price: 69.00, logo: jasperaiLogo },
  { name: "Synthesia", price: 110.00, logo: synthesiaLogo },
  { name: "Higgsfield Creator", price: 1200.00, logo: higgsFieldLogo },
  { name: "Sora", price: 120.00, logo: soraLogo },
  { name: "Veo 3", price: 99.00, logo: veo3Logo },
  { name: "Hailuo", price: 39.90, logo: hailuoLogo },
  { name: "SuperGrok", price: 79.90, logo: grokLogo },
  { name: "Claude", price: 119.90, logo: claudeLogo },
  { name: "Freepik", price: 44.90, logo: freepikLogo },
  { name: "Heygen", price: 89.00, logo: heygenLogo },
];

const totalMonthly = tools.reduce((acc, t) => acc + t.price, 0);
const extraTools = 15000;
const grandTotal = totalMonthly + extraTools;
const ourPrice = 67.00;
const savingsMonthly = grandTotal - ourPrice;
const savingsAnnual = savingsMonthly * 12;

const fmt = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const benefits = [
  { icon: Infinity, text: "Acesso ilimitado a +300 ferramentas de IA" },
  { icon: Zap, text: "Todas as versões premium e pro incluídas" },
  { icon: RefreshCw, text: "Atualizações automáticas em tempo real" },
  { icon: Shield, text: "Conta segura com proteção enterprise" },
  { icon: Headphones, text: "Suporte dedicado e prioritário 24/7" },
  { icon: Sparkles, text: "Novas ferramentas adicionadas toda semana" },
  { icon: DollarSign, text: "Sem taxas ocultas ou cobranças extras" },
];

const PainSection = () => {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <TrendingDown className="w-10 h-10 text-white/30 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Já pensou quanto você{" "}
            <span className="relative inline-block neon-underline-text">gasta por ano</span>{" "}
            com ferramentas de IA?
          </h2>
          <p className="text-white/30 max-w-xl mx-auto">
            Veja a comparação real de custos e descubra como economizar milhares de reais.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Cost table */}
          <div
            className="relative rounded-2xl overflow-hidden flex flex-col purple-hover-glow"
            style={{
              background: "rgba(10, 10, 10, 0.8)",
              backdropFilter: "blur(40px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 0 30px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at top right, rgba(255,255,255,0.03), transparent)" }} />

            <div className="relative p-8 flex-1 flex flex-col">
              <h3 className="text-white/80 font-semibold text-center mb-6">Custo Individual Mensal</h3>

              <div className="space-y-3 flex-1">
                {tools.map((tool) => (
                  <div key={tool.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <img src={tool.logo} alt={tool.name} className="w-6 h-6 rounded-md object-contain" />
                      <span className="text-white/50">{tool.name}</span>
                    </div>
                    <span className="text-white/40 font-medium">R$ {fmt(tool.price)}</span>
                  </div>
                ))}
              </div>

              {/* Outras ferramentas */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center">
                      <MoreHorizontal className="w-4 h-4 text-white/30" />
                    </div>
                    <span className="text-white/50 italic">Outras ferramentas...</span>
                  </div>
                  <span className="text-white/40 font-medium">+ R$ {fmt(extraTools)}</span>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/8">
                <div className="flex justify-between items-center">
                  <span className="text-white/70 font-semibold">Total Mensal</span>
                  <span className="text-white/80 font-bold text-xl">R$ {fmt(grandTotal)}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-white/30 text-xs">Total Anual</span>
                  <span className="text-white/40 text-sm font-semibold">R$ {fmt(grandTotal * 12)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* IA Premium card */}
          <div
            className="relative rounded-2xl overflow-hidden flex flex-col purple-hover-glow"
            style={{
              background: "rgba(10, 10, 10, 0.8)",
              backdropFilter: "blur(40px)",
              border: "1px solid rgba(180, 0, 255, 0.25)",
              boxShadow: "0 0 40px rgba(180, 0, 255, 0.08), inset 0 1px 0 rgba(180, 0, 255, 0.1)",
            }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at top right, rgba(180, 0, 255, 0.08), transparent 60%), radial-gradient(circle at bottom left, rgba(140, 0, 200, 0.05), transparent 60%)" }} />
            
            <div className="relative p-8 flex-1 flex flex-col justify-between">
              <div className="text-center">
                <span
                  className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-6 mx-auto"
                  style={{
                    background: "linear-gradient(135deg, rgba(180, 0, 255, 0.2), rgba(140, 0, 200, 0.1))",
                    border: "1px solid rgba(180, 0, 255, 0.3)",
                    color: "rgba(200, 140, 255, 0.9)",
                  }}
                >
                  <Sparkles className="w-3 h-3 inline mr-1.5 -mt-0.5" />
                  IA Premium
                </span>
                
                <div className="mb-2">
                  <span className="text-white/30 text-sm line-through">De R$ {fmt(grandTotal)}/mês</span>
                </div>
                <div className="text-5xl font-bold text-white mb-1">
                  R$ 67<span className="text-2xl">,00</span>
                </div>
                <p className="text-white/30 text-sm mb-6">/mês por tudo</p>
              </div>

              <div
                className="rounded-xl p-4 mb-6"
                style={{
                  background: "linear-gradient(135deg, rgba(180, 0, 255, 0.12), rgba(140, 0, 200, 0.06))",
                  border: "1px solid rgba(180, 0, 255, 0.2)",
                }}
              >
                <p className="font-bold text-base flex items-center justify-center gap-2" style={{ color: "rgba(200, 140, 255, 0.95)" }}>
                  <DollarSign className="w-5 h-5" />
                  Economia de R$ {fmt(savingsAnnual)}/ano
                </p>
                <p className="text-center text-white/30 text-xs mt-1">
                  R$ {fmt(savingsMonthly)}/mês de economia garantida
                </p>
              </div>

              <div className="space-y-3 text-left mb-6">
                {benefits.map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: "rgba(180, 0, 255, 0.1)",
                        border: "1px solid rgba(180, 0, 255, 0.15)",
                      }}
                    >
                      <item.icon className="w-3.5 h-3.5" style={{ color: "rgba(180, 0, 255, 0.7)" }} />
                    </div>
                    <span className="text-white/60 text-sm">{item.text}</span>
                  </div>
                ))}
              </div>

              <button
                className="w-full py-4 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-lg"
                style={{
                  background: "linear-gradient(135deg, rgba(180, 0, 255, 0.8), rgba(120, 0, 180, 0.9))",
                  border: "1px solid rgba(200, 100, 255, 0.3)",
                  boxShadow: "0 4px 25px rgba(180, 0, 255, 0.3)",
                }}
              >
                Comece a economizar agora
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PainSection;
