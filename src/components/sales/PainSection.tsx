import { motion } from "framer-motion";
import { TrendingDown, Check, DollarSign, Sparkles } from "lucide-react";

import chatgptLogo from "@/assets/tools/chatgpt.png";
import midjourneyLogo from "@/assets/tools/midjourney.png";
import elevenlabsLogo from "@/assets/tools/elevenlabs.png";
import canvaLogo from "@/assets/tools/canva.png";
import copyaiLogo from "@/assets/tools/copyai.png";
import runwaymlLogo from "@/assets/tools/runwayml.png";
import jasperaiLogo from "@/assets/tools/jasperai.png";
import synthesiaLogo from "@/assets/tools/synthesia.png";

const tools = [
  { name: "ChatGPT Plus", price: 139.90, logo: chatgptLogo },
  { name: "Midjourney", price: 60.00, logo: midjourneyLogo },
  { name: "ElevenLabs", price: 55.00, logo: elevenlabsLogo },
  { name: "Canva Pro", price: 34.90, logo: canvaLogo },
  { name: "Copy.AI", price: 49.00, logo: copyaiLogo },
  { name: "Runway ML", price: 60.00, logo: runwaymlLogo },
  { name: "Jasper AI", price: 69.00, logo: jasperaiLogo },
  { name: "Synthesia", price: 110.00, logo: synthesiaLogo },
];

const totalMonthly = tools.reduce((acc, t) => acc + t.price, 0);
const ourPrice = 67.00;
const savingsMonthly = totalMonthly - ourPrice;
const savingsAnnual = savingsMonthly * 12;

const fmt = (v: number) => v.toFixed(2).replace(".", ",");

const PainSection = () => {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <TrendingDown className="w-10 h-10 text-white/30 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Já pensou quanto você{" "}
            <span className="relative inline-block neon-underline-text">gasta por ano</span>{" "}
            com ferramentas de IA?
          </h2>
          <p className="text-white/30 max-w-xl mx-auto">
            Veja a comparação real de custos e descubra como economizar milhares de reais.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Cost table - minimalist card style */}
          <motion.div
            className="relative rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: "rgba(10, 10, 10, 0.8)",
              backdropFilter: "blur(40px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 0 30px rgba(0, 0, 0, 0.3)",
            }}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
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

              <div className="mt-6 pt-5 border-t border-white/8">
                <div className="flex justify-between items-center">
                  <span className="text-white/70 font-semibold">Total Mensal</span>
                  <span className="text-white/80 font-bold text-xl">R$ {fmt(totalMonthly)}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-white/30 text-xs">Total Anual</span>
                  <span className="text-white/40 text-sm font-semibold">R$ {fmt(totalMonthly * 12)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* IA Premium card */}
          <motion.div
            className="relative rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: "rgba(10, 10, 10, 0.8)",
              backdropFilter: "blur(40px)",
              border: "1px solid rgba(180, 0, 255, 0.25)",
              boxShadow: "0 0 40px rgba(180, 0, 255, 0.08), inset 0 1px 0 rgba(180, 0, 255, 0.1)",
            }}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {/* Purple glow overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at top right, rgba(180, 0, 255, 0.08), transparent 60%), radial-gradient(circle at bottom left, rgba(140, 0, 200, 0.05), transparent 60%)" }} />
            
            <div className="relative p-8 text-center flex-1 flex flex-col justify-center">
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
                <span className="text-white/30 text-sm line-through">De R$ {fmt(totalMonthly)}/mês</span>
              </div>
              <div className="text-5xl font-bold text-white mb-1">
                R$ 67<span className="text-2xl">,00</span>
              </div>
              <p className="text-white/30 text-sm mb-6">/mês por tudo</p>

              <div
                className="rounded-xl p-4 mb-8"
                style={{
                  background: "linear-gradient(135deg, rgba(180, 0, 255, 0.1), rgba(140, 0, 200, 0.05))",
                  border: "1px solid rgba(180, 0, 255, 0.2)",
                }}
              >
                <p className="font-semibold text-sm flex items-center justify-center gap-2" style={{ color: "rgba(200, 140, 255, 0.9)" }}>
                  <DollarSign className="w-4 h-4" />
                  Economia de R$ {fmt(savingsMonthly)}/mês — R$ {fmt(savingsAnnual)}/ano
                </p>
              </div>

              <div className="space-y-3 text-left mb-8">
                {["Acesso a +300 ferramentas", "Atualizações constantes", "Suporte dedicado", "Tudo em um só lugar"].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <Check className="w-4 h-4 shrink-0" style={{ color: "rgba(180, 0, 255, 0.6)" }} />
                    <span className="text-white/50 text-sm">{item}</span>
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
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PainSection;
