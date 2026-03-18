import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { useNavigate } from "react-router-dom";
import { Settings, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, differenceInHours, isPast } from "date-fns";

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
import inneraiLogo from "@/assets/tools/innerai.png";
import tessLogo from "@/assets/tools/tess.png";

const tools = [
  { name: "SuperGrok", ferramenta: "grok", logo: grokLogo, expiracaoDias: 3 },
  { name: "ChatGPT", ferramenta: "chatgpt", logo: chatgptLogo, expiracaoDias: 30 },
  { name: "Claude", ferramenta: "claude", logo: claudeLogo, expiracaoDias: 30 },
  { name: "Midjourney", ferramenta: "midjourney", logo: midjourneyLogo, expiracaoDias: 30 },
  { name: "ElevenLabs", ferramenta: "elevenlabs", logo: elevenlabsLogo, expiracaoDias: 30 },
  { name: "Runway ML", ferramenta: "runwayml", logo: runwaymlLogo, expiracaoDias: 30 },
  { name: "Canva Pro", ferramenta: "canva", logo: canvaLogo, expiracaoDias: 7 },
  { name: "Inner AI", ferramenta: "innerai", logo: inneraiLogo, expiracaoDias: 7 },
  { name: "Tess", ferramenta: "tess", logo: tessLogo, expiracaoDias: 7 },
  { name: "Copy.AI", ferramenta: "copyai", logo: copyaiLogo, expiracaoDias: 30 },
  { name: "Kling", ferramenta: "kling", logo: klingLogo, expiracaoDias: 30 },
  { name: "Synthesia", ferramenta: "synthesia", logo: synthesiaLogo, expiracaoDias: 30 },
  { name: "Higgsfield Creator", ferramenta: "higgsfield", logo: higgsFieldLogo, expiracaoDias: 30 },
  { name: "Sora", ferramenta: "sora", logo: soraLogo, expiracaoDias: 30 },
  { name: "Veo 3", ferramenta: "veo3", logo: veo3Logo, expiracaoDias: 30 },
  { name: "Hailuo", ferramenta: "hailuo", logo: hailuoLogo, expiracaoDias: 30 },
  { name: "Freepik", ferramenta: "freepik", logo: freepikLogo, expiracaoDias: 30 },
  { name: "Heygen", ferramenta: "heygen", logo: heygenLogo, expiracaoDias: 30 },
];

interface ToolExpiration {
  nearestExpiration: string | null;
  totalActive: number;
}

function getExpirationLabel(expDate: string) {
  const now = new Date();
  const exp = new Date(expDate);

  if (isPast(exp)) return { text: "Expirado", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" };

  const days = differenceInDays(exp, now);
  const hours = differenceInHours(exp, now);

  if (days < 1) return { text: `${hours}h restantes`, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" };
  if (days <= 3) return { text: `${days}d restantes`, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" };
  return { text: `${days}d restantes`, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" };
}

export default function DashboardFerramentas() {
  const navigate = useNavigate();
  const [expirations, setExpirations] = useState<Record<string, ToolExpiration>>({});

  useEffect(() => {
    async function fetchExpirations() {
      const { data } = await supabase
        .from("acessos")
        .select("ferramenta, data_expiracao")
        .order("data_expiracao", { ascending: true });

      if (!data) return;

      const map: Record<string, ToolExpiration> = {};
      const now = new Date();

      for (const row of data) {
        const key = row.ferramenta;
        if (!map[key]) map[key] = { nearestExpiration: null, totalActive: 0 };

        const exp = new Date(row.data_expiracao);
        if (!isPast(exp)) {
          map[key].totalActive++;
          if (!map[key].nearestExpiration || exp < new Date(map[key].nearestExpiration!)) {
            map[key].nearestExpiration = row.data_expiracao;
          }
        }
      }

      setExpirations(map);
    }

    fetchExpirations();
  }, []);

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
                Gerencie os acessos de cada ferramenta. O tempo de expiração é exibido automaticamente.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tools.map((tool) => {
                const info = expirations[tool.ferramenta];
                const expLabel = info?.nearestExpiration ? getExpirationLabel(info.nearestExpiration) : null;

                return (
                  <div
                    key={tool.name}
                    onClick={() => navigate(`/dashboard-ferramentas/${tool.ferramenta}`)}
                    className="group flex flex-col gap-2.5 p-3.5 rounded-xl border border-border/50 hover:border-border bg-card/50 hover:bg-card transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-muted/30 border border-border/30">
                        <img src={tool.logo} alt={tool.name} className="w-7 h-7 object-contain" loading="lazy" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-foreground font-semibold text-sm">{tool.name}</h3>
                      </div>
                      <Settings className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>

                    {/* Expiration info */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/30">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                        <Clock className="w-3 h-3" />
                        <span>Ciclo: {tool.expiracaoDias} dias</span>
                      </div>
                      {expLabel ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${expLabel.bg} ${expLabel.color}`}>
                          {expLabel.color.includes("yellow") || expLabel.color.includes("red") ? (
                            <AlertTriangle className="w-2.5 h-2.5" />
                          ) : null}
                          {expLabel.text}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50 text-[10px]">Sem acessos</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
