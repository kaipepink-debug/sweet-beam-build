import { motion } from "framer-motion";
import { TrendingDown, Check, DollarSign } from "lucide-react";

import chatgptLogo from "@/assets/tools/chatgpt.png";
import midjourneyLogo from "@/assets/tools/midjourney.png";
import elevenlabsLogo from "@/assets/tools/elevenlabs.png";
import canvaLogo from "@/assets/tools/canva.png";
import copyaiLogo from "@/assets/tools/copyai.png";
import runwaymlLogo from "@/assets/tools/runwayml.png";
import jasperaiLogo from "@/assets/tools/jasperai.png";
import synthesiaLogo from "@/assets/tools/synthesia.png";

const tools = [
  { name: "ChatGPT Plus", price: "R$ 139,90", logo: chatgptLogo },
  { name: "Midjourney", price: "R$ 60,00", logo: midjourneyLogo },
  { name: "ElevenLabs", price: "R$ 55,00", logo: elevenlabsLogo },
  { name: "Canva Pro", price: "R$ 34,90", logo: canvaLogo },
  { name: "Copy.AI", price: "R$ 49,00", logo: copyaiLogo },
  { name: "Runway ML", price: "R$ 60,00", logo: runwaymlLogo },
  { name: "Jasper AI", price: "R$ 69,00", logo: jasperaiLogo },
  { name: "Synthesia", price: "R$ 110,00", logo: synthesiaLogo },
];

const totalMonthly = tools.reduce((acc, t) => acc + parseFloat(t.price.replace("R$ ", "").replace(",", ".")), 0);
const totalAnnual = totalMonthly * 12;

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

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Cost table */}
          <motion.div
            className="rounded-2xl border border-white/8 overflow-hidden"
            style={{ background: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(16px)" }}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="p-5 border-b border-white/8">
              <h3 className="text-white/80 font-semibold">Custo Individual Mensal</h3>
            </div>
            <div className="divide-y divide-white/5">
              {tools.map((tool) => (
                <div key={tool.name} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <img src={tool.logo} alt={tool.name} className="w-6 h-6 rounded-md object-contain" />
                    <span className="text-white/50">{tool.name}</span>
                  </div>
                  <span className="text-white/40 font-medium">{tool.price}/mês</span>
                </div>
              ))}
            </div>
            <div className="p-5 border-t border-white/8" style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="flex justify-between">
                <span className="text-white/70 font-semibold">Total Anual</span>
                <span className="text-white/80 font-bold text-lg">
                  R$ {totalAnnual.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          </motion.div>

          {/* IA Premium card */}
          <motion.div
            className="relative rounded-2xl border border-white/10 overflow-hidden"
            style={{ background: "rgba(10, 10, 10, 0.8)", backdropFilter: "blur(40px)" }}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0" style={{ background: "radial-gradient(circle at top right, rgba(255,255,255,0.03), transparent)" }} />
            
            <div className="relative p-8 text-center">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/60 border border-white/10 mb-6">
                IA Premium
              </span>
              
              <div className="mb-2">
                <span className="text-white/30 text-sm line-through">De R$ {totalMonthly.toFixed(2).replace(".", ",")}/mês</span>
              </div>
              <div className="text-5xl font-bold text-white mb-1">
                R$ 159<span className="text-2xl">,90</span>
              </div>
              <p className="text-white/30 text-sm mb-6">/mês por tudo</p>

              <div className="rounded-xl p-4 mb-8 border border-white/8" style={{ background: "rgba(255,255,255,0.03)" }}>
                <p className="text-white/60 font-semibold text-sm flex items-center justify-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Economia de até R$ {(totalAnnual - 159.90 * 12).toFixed(2).replace(".", ",")}/ano
                </p>
              </div>

              <div className="space-y-3 text-left mb-8">
                {["Acesso a +300 ferramentas", "Atualizações constantes", "Suporte dedicado"].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-white/40 shrink-0" />
                    <span className="text-white/50 text-sm">{item}</span>
                  </div>
                ))}
              </div>

              <button
                className="w-full py-4 rounded-xl font-semibold text-white/90 transition-all hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, rgba(60, 60, 60, 1), rgba(40, 40, 40, 1))",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
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
