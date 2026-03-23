import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isPast } from "date-fns";
import { AlertTriangle, X } from "lucide-react";

interface ToolAlert {
  ferramenta: string;
  type: "expired" | "no_logins";
  count?: number;
}

const toolNames: Record<string, string> = {
  grok: "SuperGrok", chatgpt: "ChatGPT", claude: "Claude", gemini: "Gemini",
  midjourney: "Midjourney", elevenlabs: "ElevenLabs", runwayml: "Runway ML",
  canva: "Canva Pro", innerai: "Inner AI", tess: "Tess", copyai: "Copy.AI",
  kling: "Kling", synthesia: "Synthesia", higgsfield: "Higgsfield",
  sora: "Sora", veo3: "Veo 3", hailuo: "Hailuo", freepik: "Freepik",
  heygen: "Heygen", leonardoai: "Leonardo AI", capcut: "CapCut",
};

const allTools = Object.keys(toolNames);

export function ToolAlerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<ToolAlert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function check() {
      const { data } = await supabase
        .from("acessos")
        .select("ferramenta, data_expiracao");

      if (!data) return;

      const toolStats: Record<string, { total: number; expired: number; expiringSoon: number }> = {};

      for (const tool of allTools) {
        toolStats[tool] = { total: 0, expired: 0, expiringSoon: 0 };
      }

      const now = new Date();

      for (const row of data) {
        if (!toolStats[row.ferramenta]) toolStats[row.ferramenta] = { total: 0, expired: 0, expiringSoon: 0 };
        toolStats[row.ferramenta].total++;
        const expDate = new Date(row.data_expiracao);
        if (isPast(expDate)) {
          toolStats[row.ferramenta].expired++;
        } else if (differenceInDays(expDate, now) <= 7) {
          toolStats[row.ferramenta].expiringSoon++;
        }
      }

      const newAlerts: ToolAlert[] = [];

      for (const [tool, stats] of Object.entries(toolStats)) {
        if (stats.total === 0) {
          newAlerts.push({ ferramenta: tool, type: "no_logins" });
        }
        if (stats.expired > 0) {
          newAlerts.push({ ferramenta: tool, type: "expired", count: stats.expired });
        }
        if (stats.expiringSoon > 0) {
          newAlerts.push({ ferramenta: tool, type: "expiring_soon", count: stats.expiringSoon });
        }
      }

      setAlerts(newAlerts);
    }

    check();
  }, []);

  const visible = alerts.filter(a => !dismissed.has(`${a.ferramenta}-${a.type}`));

  if (visible.length === 0) return null;

  const expiredAlerts = visible.filter(a => a.type === "expired");
  const expiringSoonAlerts = visible.filter(a => a.type === "expiring_soon");
  const noLoginAlerts = visible.filter(a => a.type === "no_logins");

  return (
    <div className="space-y-2 mb-4">
      {expiredAlerts.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-destructive">Logins expirados</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {expiredAlerts.map((a, i) => (
                <span key={a.ferramenta}>
                  {i > 0 && ", "}
                  <span
                    className="text-destructive hover:underline cursor-pointer font-medium"
                    onClick={() => navigate(`/dashboard-ferramentas/${a.ferramenta}`)}
                  >
                    {toolNames[a.ferramenta] || a.ferramenta}
                  </span>
                  {` (${a.count})`}
                </span>
              ))}
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard-ferramentas")}
            className="text-xs font-medium text-destructive hover:underline whitespace-nowrap"
          >
            Ver ferramentas
          </button>
          <button
            onClick={() => {
              const keys = expiredAlerts.map(a => `${a.ferramenta}-${a.type}`);
              setDismissed(prev => new Set([...prev, ...keys]));
            }}
            className="text-muted-foreground hover:text-foreground p-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {expiringSoonAlerts.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-3">
          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-yellow-500">Logins prestes a vencer (7 dias)</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {expiringSoonAlerts.map((a, i) => (
                <span key={a.ferramenta}>
                  {i > 0 && ", "}
                  <span
                    className="text-yellow-500 hover:underline cursor-pointer font-medium"
                    onClick={() => navigate(`/dashboard-ferramentas/${a.ferramenta}`)}
                  >
                    {toolNames[a.ferramenta] || a.ferramenta}
                  </span>
                  {` (${a.count})`}
                </span>
              ))}
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard-ferramentas")}
            className="text-xs font-medium text-yellow-500 hover:underline whitespace-nowrap"
          >
            Ver ferramentas
          </button>
          <button
            onClick={() => {
              const keys = expiringSoonAlerts.map(a => `${a.ferramenta}-${a.type}`);
              setDismissed(prev => new Set([...prev, ...keys]));
            }}
            className="text-muted-foreground hover:text-foreground p-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {noLoginAlerts.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-destructive">Ferramentas sem logins</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {noLoginAlerts.map((a, i) => (
                <span key={a.ferramenta}>
                  {i > 0 && ", "}
                  <span
                    className="text-destructive hover:underline cursor-pointer font-medium"
                    onClick={() => navigate(`/dashboard-ferramentas/${a.ferramenta}`)}
                  >
                    {toolNames[a.ferramenta] || a.ferramenta}
                  </span>
                </span>
              ))}
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard-ferramentas")}
            className="text-xs font-medium text-destructive hover:underline whitespace-nowrap"
          >
            Configurar
          </button>
          <button
            onClick={() => {
              const keys = noLoginAlerts.map(a => `${a.ferramenta}-${a.type}`);
              setDismissed(prev => new Set([...prev, ...keys]));
            }}
            className="text-muted-foreground hover:text-foreground p-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
