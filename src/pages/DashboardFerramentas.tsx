import { useEffect, useState } from "react";
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
import geminiLogo from "@/assets/tools/gemini.png";
import leonardoaiLogo from "@/assets/tools/leonardoai.png";

const tools = [
  { name: "SuperGrok", ferramenta: "grok", logo: grokLogo, expiracaoDias: 3 },
  { name: "ChatGPT", ferramenta: "chatgpt", logo: chatgptLogo, expiracaoDias: 30 },
  { name: "Claude", ferramenta: "claude", logo: claudeLogo, expiracaoDias: 30 },
  { name: "Gemini", ferramenta: "gemini", logo: geminiLogo, expiracaoDias: 30 },
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
  { name: "Leonardo AI", ferramenta: "leonardoai", logo: leonardoaiLogo, expiracaoDias: 30 },
];

interface ToolExpiration {
  nearestExpiration: string | null;
  totalActive: number;
}

function getExpirationLabel(expDate: string) {
  const now = new Date();
  const exp = new Date(expDate);

  if (isPast(exp)) return { text: "Expirado", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", dot: "bg-red-500" };

  const days = differenceInDays(exp, now);
  const hours = differenceInHours(exp, now);

  if (days <= 1) return { text: days < 1 ? `${hours}h restantes` : `${days}d restante`, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", dot: "bg-orange-500" };
  return { text: `${days}d restantes`, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-500" };
}

function getToolDotColor(info: ToolExpiration | undefined) {
  if (!info || info.totalActive === 0) return "bg-red-500";
  if (!info.nearestExpiration) return "bg-red-500";
  const label = getExpirationLabel(info.nearestExpiration);
  return label.dot;
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
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Ferramentas de IA</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie os acessos de cada ferramenta. O tempo de expiração é exibido automaticamente.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tools.map((tool) => {
            const info = expirations[tool.ferramenta];
            const expLabel = info?.nearestExpiration ? getExpirationLabel(info.nearestExpiration) : null;

            return (
              <div
                key={tool.name}
                onClick={() => navigate(`/dashboard-ferramentas/${tool.ferramenta}`)}
                className="group flex flex-col gap-3 p-4 rounded-xl border border-border/50 hover:border-border bg-card/50 hover:bg-card transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-muted/30 border border-border/30">
                    <img src={tool.logo} alt={tool.name} className="w-8 h-8 object-contain" loading="lazy" />
                  </div>
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <h3 className="text-foreground font-semibold text-base">{tool.name}</h3>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${getToolDotColor(info)}`} />
                  </div>
                  <Settings className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                </div>

                {/* Expiration info */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/30">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span>Ciclo: {tool.expiracaoDias} dias</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-blue-500/10 border-blue-500/20 text-blue-400">
                      {info?.totalActive ?? 0} {info?.totalActive === 1 ? "login" : "logins"}
                    </span>
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
              </div>
            );
          })}
      </div>
    </div>
  );
}
