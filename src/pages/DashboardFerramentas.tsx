import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { useNavigate } from "react-router-dom";
import { Settings, Star } from "lucide-react";

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

const tools = [
  { name: "SuperGrok", logo: grokLogo, rating: 4.9, route: "/dashboard-ferramentas/grok" },
  { name: "ChatGPT", logo: chatgptLogo, rating: 4.9, route: null },
  { name: "Claude", logo: claudeLogo, rating: 4.9, route: null },
  { name: "Midjourney", logo: midjourneyLogo, rating: 4.9, route: null },
  { name: "ElevenLabs", logo: elevenlabsLogo, rating: 4.8, route: null },
  { name: "Runway ML", logo: runwaymlLogo, rating: 4.9, route: null },
  { name: "Canva Pro", logo: canvaLogo, rating: 4.9, route: null },
  { name: "Copy.AI", logo: copyaiLogo, rating: 4.8, route: null },
  { name: "Kling", logo: klingLogo, rating: 4.8, route: null },
  { name: "Synthesia", logo: synthesiaLogo, rating: 4.9, route: null },
  { name: "Higgsfield Creator", logo: higgsFieldLogo, rating: 4.7, route: null },
  { name: "Sora", logo: soraLogo, rating: 4.9, route: null },
  { name: "Veo 3", logo: veo3Logo, rating: 4.8, route: null },
  { name: "Hailuo", logo: hailuoLogo, rating: 4.8, route: null },
  { name: "Freepik", logo: freepikLogo, rating: 4.8, route: null },
  { name: "Heygen", logo: heygenLogo, rating: 4.8, route: null },
];

export default function DashboardFerramentas() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex w-full bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0 ml-[60px]">
        <DashboardTopbar />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-foreground">Ferramentas de IA</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie os acessos de cada ferramenta clicando no ícone de configuração.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tools.map((tool) => (
                <div
                  key={tool.name}
                  className="group flex items-center gap-3 p-3.5 rounded-xl border border-border/50 hover:border-border bg-card/50 hover:bg-card transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-muted/30 border border-border/30">
                    <img src={tool.logo} alt={tool.name} className="w-7 h-7 object-contain" loading="lazy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-foreground font-semibold text-sm">{tool.name}</h3>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star
                          key={s}
                          className="w-2.5 h-2.5"
                          style={{
                            color: s < Math.floor(tool.rating) ? "hsl(var(--muted-foreground))" : "hsl(var(--muted))",
                            fill: s < Math.floor(tool.rating) ? "hsl(var(--muted-foreground))" : "transparent",
                          }}
                        />
                      ))}
                      <span className="text-muted-foreground text-[10px] ml-1">{tool.rating}</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-500 border border-green-500/20">
                      Ativa
                    </span>
                    <button
                      onClick={() => {
                        if (tool.route) navigate(tool.route);
                      }}
                      disabled={!tool.route}
                      className={`p-1.5 rounded-lg transition-colors ${
                        tool.route
                          ? "hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground"
                          : "text-muted-foreground/30 cursor-not-allowed"
                      }`}
                      title={tool.route ? "Gerenciar acessos" : "Em breve"}
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
