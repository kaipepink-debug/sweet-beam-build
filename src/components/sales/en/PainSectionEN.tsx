import { TrendingDown, DollarSign, Sparkles, Zap, Shield, RefreshCw, Headphones, Infinity, MoreHorizontal } from "lucide-react";

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
import freepikLogo from "@/assets/tools/freepik.png";
import heygenLogo from "@/assets/tools/heygen.png";
import geminiLogo from "@/assets/tools/gemini.png";

const tools = [
  { name: "ChatGPT", price: 24.00, logo: chatgptLogo },
  { name: "Gemini", price: 20.00, logo: geminiLogo },
  { name: "Midjourney", price: 36.00, logo: midjourneyLogo },
  { name: "ElevenLabs", price: 26.00, logo: elevenlabsLogo },
  { name: "Runway ML", price: 18.00, logo: runwaymlLogo },
  { name: "Canva Pro", price: 11.00, logo: canvaLogo },
  { name: "Copy.AI", price: 50.00, logo: copyaiLogo },
  { name: "Kling", price: 36.00, logo: klingLogo },
  { name: "Synthesia", price: 32.00, logo: synthesiaLogo },
  { name: "Higgsfield", price: 18.00, logo: higgsFieldLogo },
  { name: "Sora", price: 24.00, logo: soraLogo },
  { name: "Veo 3", price: 20.00, logo: veo3Logo },
  { name: "Hailuo", price: 14.00, logo: hailuoLogo },
  { name: "SuperGrok", price: 32.00, logo: grokLogo },
  { name: "Claude", price: 24.00, logo: claudeLogo },
  { name: "Freepik", price: 9.00, logo: freepikLogo },
  { name: "Heygen", price: 18.00, logo: heygenLogo },
];

const totalMonthly = tools.reduce((acc, t) => acc + t.price, 0);
const extraTools = 3000;
const grandTotal = totalMonthly + extraTools;
const ourPrice = 24.00;
const savingsMonthly = grandTotal - ourPrice;
const savingsAnnual = savingsMonthly * 12;

const fmt = (v: number) => v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const benefits = [
  { icon: Infinity, text: "Unlimited access to +300 AI tools" },
  { icon: Zap, text: "All Premium and Pro versions included" },
  { icon: RefreshCw, text: "Automatic real-time updates" },
  { icon: Shield, text: "Secure account with enterprise protection" },
  { icon: Headphones, text: "Dedicated and priority 24/7 support" },
  { icon: Sparkles, text: "New tools added every week" },
  { icon: DollarSign, text: "No hidden fees or extra charges" },
];

const PainSectionEN = () => {
  return (
    <section className="relative py-12 md:py-16 px-3 md:px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <TrendingDown className="w-7 h-7 md:w-8 md:h-8 text-white/30 mx-auto mb-2 md:mb-3" />
          <h2 className="text-3xl md:text-3xl font-bold text-white mb-2 md:mb-3">
            Have you ever thought how much you{" "}
            <span className="relative inline-block neon-underline-text">spend per year</span>{" "}
            on AI tools?
          </h2>
          <p className="text-white/30 max-w-lg mx-auto text-base md:text-sm">
            See the real cost comparison and discover how to save thousands of dollars.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-3 md:gap-6 items-stretch">
          <div
            className="relative rounded-xl overflow-hidden flex flex-col purple-hover-glow"
            style={{
              background: "rgba(10, 10, 10, 0.8)",
              backdropFilter: "blur(40px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 0 30px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at top right, rgba(255,255,255,0.03), transparent)" }} />

            <div className="relative p-4 md:p-6 flex-1 flex flex-col">
              <h3 className="text-white/80 font-semibold text-center mb-3 md:mb-4 text-xs md:text-sm">Individual Monthly Cost</h3>

              <div className="space-y-2 flex-1">
                {tools.map((tool) => (
                  <div key={tool.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img src={tool.logo} alt={tool.name} className="w-5 h-5 rounded-md object-contain" />
                      <span className="text-white/50">{tool.name}</span>
                    </div>
                    <span className="text-white/40 font-medium">$ {fmt(tool.price)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center">
                      <MoreHorizontal className="w-3 h-3 text-white/30" />
                    </div>
                    <span className="text-white/50 italic">Other tools...</span>
                  </div>
                  <span className="text-white/40 font-medium">+ $ {fmt(extraTools)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/8">
                <div className="flex justify-between items-center">
                  <span className="text-white/70 font-semibold text-sm">Monthly Total</span>
                  <span className="text-white/80 font-bold text-lg">$ {fmt(grandTotal)}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-white/30 text-[11px]">Annual Total</span>
                  <span className="text-white/40 text-xs font-semibold">$ {fmt(grandTotal * 12)}</span>
                </div>
              </div>
            </div>
          </div>

          <div
            className="relative rounded-xl overflow-hidden flex flex-col purple-hover-glow"
            style={{
              background: "rgba(10, 10, 10, 0.8)",
              backdropFilter: "blur(40px)",
              border: "1px solid rgba(180, 0, 255, 0.25)",
              boxShadow: "0 0 40px rgba(180, 0, 255, 0.08), inset 0 1px 0 rgba(180, 0, 255, 0.1)",
            }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at top right, rgba(180, 0, 255, 0.08), transparent 60%), radial-gradient(circle at bottom left, rgba(140, 0, 200, 0.05), transparent 60%)" }} />

            <div className="relative p-4 md:p-6 flex-1 flex flex-col justify-between">
              <div className="text-center">
                <span
                  className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold mb-4 mx-auto"
                  style={{
                    background: "linear-gradient(135deg, rgba(180, 0, 255, 0.2), rgba(140, 0, 200, 0.1))",
                    border: "1px solid rgba(180, 0, 255, 0.3)",
                    color: "rgba(200, 140, 255, 0.9)",
                  }}
                >
                  <Sparkles className="w-3 h-3 inline mr-1 -mt-0.5" />
                  Premium AI
                </span>

                <div className="mb-1">
                  <span className="text-white/30 text-xs line-through">From $ {fmt(grandTotal)}/month</span>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  $ 24<span className="text-xl">.00</span>
                </div>
                <p className="text-white/30 text-xs mb-4">/month for everything</p>
              </div>

              <div
                className="rounded-lg p-3 mb-4"
                style={{
                  background: "linear-gradient(135deg, rgba(180, 0, 255, 0.12), rgba(140, 0, 200, 0.06))",
                  border: "1px solid rgba(180, 0, 255, 0.2)",
                }}
              >
                <p className="font-bold text-sm flex items-center justify-center gap-2" style={{ color: "rgba(200, 140, 255, 0.95)" }}>
                  <DollarSign className="w-4 h-4" />
                  Save $ {fmt(savingsAnnual)}/year
                </p>
                <p className="text-center text-white/30 text-[11px] mt-1">
                  $ {fmt(savingsMonthly)}/month in guaranteed savings
                </p>
              </div>

              <div className="space-y-2 text-left mb-4">
                {benefits.map((item) => (
                  <div key={item.text} className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                      style={{
                        background: "rgba(180, 0, 255, 0.1)",
                        border: "1px solid rgba(180, 0, 255, 0.15)",
                      }}
                    >
                      <item.icon className="w-3 h-3" style={{ color: "rgba(180, 0, 255, 0.7)" }} />
                    </div>
                    <span className="text-white/60 text-xs">{item.text}</span>
                  </div>
                ))}
              </div>

              <button
                className="w-full py-3 rounded-lg font-semibold text-sm text-white transition-all hover:scale-[1.02] hover:shadow-lg"
                style={{
                  background: "linear-gradient(135deg, rgba(180, 0, 255, 0.8), rgba(120, 0, 180, 0.9))",
                  border: "1px solid rgba(200, 100, 255, 0.3)",
                  boxShadow: "0 4px 25px rgba(180, 0, 255, 0.3)",
                }}
              >
                Start saving now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PainSectionEN;
