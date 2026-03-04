import { motion } from "framer-motion";
import { Star, ExternalLink } from "lucide-react";

const tools = [
  { name: "ChatGPT", desc: "Assistente de IA conversacional mais avançado do mundo.", rating: 5 },
  { name: "Midjourney", desc: "Geração de imagens artísticas com qualidade profissional.", rating: 5 },
  { name: "ElevenLabs", desc: "Síntese de voz ultra-realista com clonagem de voz.", rating: 4.8 },
  { name: "Runway ML", desc: "Edição de vídeo com IA generativa de última geração.", rating: 4.7 },
  { name: "Canva Pro", desc: "Design gráfico intuitivo com recursos premium de IA.", rating: 4.9 },
  { name: "Copy.AI", desc: "Copywriting automatizado para marketing e vendas.", rating: 4.6 },
  { name: "Jasper AI", desc: "Criação de conteúdo otimizado para SEO e conversão.", rating: 4.5 },
  { name: "Synthesia", desc: "Criação de vídeos com avatares de IA realistas.", rating: 4.7 },
];

const ToolsSection = () => {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ferramentas <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Premium</span>
          </h2>
          <p className="text-white/40 max-w-xl mx-auto">
            Acesse as ferramentas de IA mais poderosas do mercado, todas incluídas no seu plano.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.name}
              className="group flex items-center gap-4 p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-cyan-500/15 transition-all"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center shrink-0 text-lg font-bold text-cyan-400">
                {tool.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold text-sm">{tool.name}</h3>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${s < Math.floor(tool.rating) ? "text-amber-400 fill-amber-400" : "text-white/20"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-white/40 text-xs leading-relaxed truncate">{tool.desc}</p>
              </div>
              <div className="shrink-0">
                <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Incluso
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
