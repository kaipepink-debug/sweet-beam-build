import { useState } from "react";
import { Star, ArrowRight } from "lucide-react";

import chatgptLogo from "@/assets/tools/chatgpt.png";
import midjourneyLogo from "@/assets/tools/midjourney.png";
import elevenlabsLogo from "@/assets/tools/elevenlabs.png";
import canvaLogo from "@/assets/tools/canva.png";
import copyaiLogo from "@/assets/tools/copyai.png";
import runwaymlLogo from "@/assets/tools/runwayml.png";
import klingLogo from "@/assets/tools/kling.png";
import synthesiaLogo from "@/assets/tools/synthesia.png";
import higgsFieldLogo from "@/assets/tools/higgsfield.png";
import soraLogo from "@/assets/tools/sora.png";
import veo3Logo from "@/assets/tools/veo3.png";
import hailuoLogo from "@/assets/tools/hailuo.png";
import grokLogo from "@/assets/tools/grok.png";
import claudeLogo from "@/assets/tools/claude.png";
import perplexityLogo from "@/assets/tools/perplexity.png";
import freepikLogo from "@/assets/tools/freepik.png";
import heygenLogo from "@/assets/tools/heygen.png";
import geminiLogo from "@/assets/tools/gemini.png";

const tools = [
  { name: "ChatGPT", desc: "The world's most advanced conversational AI assistant.", rating: 4.9, logo: chatgptLogo },
  { name: "Gemini", desc: "Google's multimodal AI with advanced reasoning.", rating: 4.9, logo: geminiLogo },
  { name: "Midjourney", desc: "Artistic image generation with professional quality.", rating: 4.9, logo: midjourneyLogo },
  { name: "ElevenLabs", desc: "Ultra-realistic voice synthesis with voice cloning.", rating: 4.8, logo: elevenlabsLogo },
  { name: "Runway ML", desc: "Cutting-edge generative AI video editing.", rating: 4.9, logo: runwaymlLogo },
  { name: "Canva Pro", desc: "Intuitive graphic design with premium AI features.", rating: 4.9, logo: canvaLogo },
  { name: "Copy.AI", desc: "Automated copywriting for marketing and sales.", rating: 4.8, logo: copyaiLogo },
  { name: "Kling", desc: "AI video generation with high quality and realism.", rating: 4.8, logo: klingLogo },
  { name: "Synthesia", desc: "Video creation with realistic AI avatars.", rating: 4.9, logo: synthesiaLogo },
  { name: "Higgsfield Creator", desc: "High quality short-form AI video generation.", rating: 4.7, logo: higgsFieldLogo },
  { name: "Sora", desc: "Realistic video generation from text.", rating: 4.9, logo: soraLogo },
  { name: "Veo 3", desc: "Google's video AI with cinematic quality.", rating: 4.8, logo: veo3Logo },
  { name: "Hailuo", desc: "Innovative generative AI video creation.", rating: 4.8, logo: hailuoLogo },
  { name: "SuperGrok", desc: "Advanced conversational AI with real-time access.", rating: 4.9, logo: grokLogo },
  { name: "Claude", desc: "Safe and reliable AI assistant by Anthropic.", rating: 4.9, logo: claudeLogo },
  { name: "Freepik", desc: "Image and design library with AI generation.", rating: 4.8, logo: freepikLogo },
  { name: "Heygen", desc: "Video creation with avatars and AI translation.", rating: 4.8, logo: heygenLogo },
  { name: "Perplexity AI", desc: "Smart search with AI and real-time grounded answers.", rating: 4.8, logo: perplexityLogo },
];

const ToolsSectionEN = () => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section id="ferramentas" className="relative py-12 md:py-16 px-3 md:px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-3xl font-bold text-white mb-2 md:mb-3">
            Premium{" "}
            <span className="relative inline-block neon-underline-text">
              Tools
              <span className="neon-trail" />
            </span>
          </h2>
          <p className="text-white/30 max-w-lg mx-auto text-base md:text-sm">
            Access the most powerful AI tools on the market, all included in your plan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-3">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className={`group flex items-center gap-2.5 p-2.5 sm:p-3.5 rounded-lg md:rounded-xl border transition-all duration-300 cursor-pointer sm:cursor-default purple-hover-glow ${
                selected === tool.name ? "border-white/15" : "border-white/5 hover:border-white/10"
              }`}
              style={{ background: selected === tool.name ? "rgba(15, 15, 15, 0.85)" : "rgba(10, 10, 10, 0.7)", backdropFilter: "blur(12px)" }}
              onClick={() => setSelected(selected === tool.name ? null : tool.name)}
            >
              <div
                className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
                style={{ background: "rgba(180, 0, 255, 0.05)", border: "1px solid rgba(180, 0, 255, 0.1)" }}
              >
                <img src={tool.logo} alt={tool.name} className="w-6 h-6 md:w-7 md:h-7 object-contain" loading="lazy" decoding="async" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-white/85 font-semibold text-sm md:text-xs">{tool.name}</h3>
                  <div className="flex gap-0.5 items-center">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        className="w-2.5 h-2.5"
                        style={{
                          color: s < Math.floor(tool.rating) ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.1)",
                          fill: s < Math.floor(tool.rating) ? "rgba(255,255,255,0.45)" : "transparent",
                        }}
                      />
                    ))}
                    <span className="text-white/30 text-[9px] ml-0.5">{tool.rating}</span>
                  </div>
                </div>
                <p className={`text-white/30 text-xs md:text-[11px] leading-relaxed ${
                  selected === tool.name ? "whitespace-normal" : "truncate"
                }`}>{tool.desc}</p>
              </div>
              <div className="shrink-0 flex items-center gap-1.5">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide"
                  style={{
                    background: "rgba(34, 197, 94, 0.1)",
                    color: "rgba(34, 197, 94, 0.9)",
                    border: "1px solid rgba(34, 197, 94, 0.2)",
                  }}
                >
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-8 rounded-xl p-6 text-center relative overflow-hidden"
          style={{
            background: "rgba(10, 10, 10, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="relative z-10">
            <div className="mb-3">
              <span className="text-3xl md:text-4xl font-light tracking-tight text-white/40">+300</span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white/90 mb-2">
              AI Tools Included
            </h3>
            <p className="text-white/35 max-w-md mx-auto text-xs leading-relaxed mb-4">
              Our catalog has more than 300 artificial intelligence tools across text, image, video, audio, code and much more — all available in your plan.
            </p>
            <a
              href="#planos"
              className="neon-border-btn relative inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold text-white/80 overflow-hidden transition-all duration-300 hover:gap-3"
              style={{ border: "1px solid rgba(255,255,255,0.15)", background: "transparent" }}
            >
              <span className="relative z-10 flex items-center gap-2">
                See all plans
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <span className="neon-trail" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToolsSectionEN;
