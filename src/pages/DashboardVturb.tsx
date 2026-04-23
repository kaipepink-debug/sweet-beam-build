import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Video, Save, Code2 } from "lucide-react";

interface VturbConfig {
  id?: string;
  player_id: string;
  script_url: string;
  updated_at?: string;
}

function parseVturbCode(code: string): { player_id: string; script_url: string } | null {
  const idMatch = code.match(/id=["']([^"']+)["']/);
  const srcMatch = code.match(/s\.src\s*=\s*["']([^"']+)["']/) || code.match(/src=["']([^"']+converteai\.net[^"']+)["']/);
  if (!idMatch || !srcMatch) return null;
  return { player_id: idMatch[1], script_url: srcMatch[1] };
}

export default function DashboardVturb() {
  const [config, setConfig] = useState<VturbConfig | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("vturb_config")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) {
      setConfig(data as VturbConfig);
      setCode(
        `<vturb-smartplayer id="${data.player_id}" style="display: block; margin: 0 auto; width: 100%;"></vturb-smartplayer>\n<script type="text/javascript">\n  var s=document.createElement("script");\n  s.src="${data.script_url}", s.async=!0,document.head.appendChild(s);\n</script>`
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    const parsed = parseVturbCode(code);
    if (!parsed) {
      toast.error("Código inválido. Cole o snippet completo do VTurb (com <vturb-smartplayer> e o <script>).");
      return;
    }
    setSaving(true);
    const payload = { ...parsed, updated_at: new Date().toISOString() };
    let res;
    if (config?.id) {
      res = await supabase.from("vturb_config").update(payload).eq("id", config.id);
    } else {
      res = await supabase.from("vturb_config").insert(payload);
    }
    setSaving(false);
    if (res.error) {
      toast.error("Erro ao salvar: " + res.error.message);
      return;
    }
    toast.success("Vídeo da página de vendas atualizado!");
    load();
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-muted-foreground mb-1">Página de Vendas</p>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <Video className="h-6 w-6 text-primary" />
          VTurb — Vídeo Principal
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cole o código completo do VTurb abaixo. O vídeo da página de vendas será atualizado automaticamente.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="vturb-code" className="text-sm font-medium flex items-center gap-2">
            <Code2 className="h-4 w-4" /> Código do VTurb
          </Label>
          <Textarea
            id="vturb-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={10}
            placeholder={`<vturb-smartplayer id="vid-XXXX" ...></vturb-smartplayer>\n<script>...</script>`}
            className="font-mono text-xs"
          />
          <p className="text-[11px] text-muted-foreground">
            Aceita o snippet completo (tag do player + script). Extraímos automaticamente o ID e a URL do script.
          </p>
        </div>

        {config && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-border/40">
            <div>
              <Label className="text-[11px] text-muted-foreground">Player ID atual</Label>
              <Input readOnly value={config.player_id} className="text-xs font-mono mt-1" />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">Script URL atual</Label>
              <Input readOnly value={config.script_url} className="text-xs font-mono mt-1" />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={saving || loading} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar e atualizar página de vendas"}
          </Button>
        </div>
      </div>
    </div>
  );
}
