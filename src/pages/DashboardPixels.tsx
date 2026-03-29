import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save, Facebook, Send, CheckCircle2, Trash2, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PixelConfig {
  id: string;
  platform: string;
  pixel_id: string;
  api_token: string;
  enabled: boolean;
}

const platformConfig = {
  facebook: {
    label: "Facebook Ads",
    icon: Facebook,
    color: "from-blue-600 to-blue-500",
    bgGlow: "rgba(59, 130, 246, 0.15)",
  },
  tiktok: {
    label: "TikTok Ads",
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.86a8.28 8.28 0 0 0 4.76 1.51V6.93a4.84 4.84 0 0 1-1-.24z" />
      </svg>
    ),
    color: "from-pink-500 to-violet-500",
    bgGlow: "rgba(236, 72, 153, 0.15)",
  },
};

function generateOrderId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "TST-";
  for (let i = 0; i < 5; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

export default function DashboardPixels() {
  const [pixels, setPixels] = useState<PixelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // TikTok Purchase Activator state
  const [ttPixelId, setTtPixelId] = useState("");
  const [ttAccessToken, setTtAccessToken] = useState("");
  const [ttValue, setTtValue] = useState("97,90");
  const [ttOrderId, setTtOrderId] = useState(generateOrderId());
  const [ttSending, setTtSending] = useState(false);

  useEffect(() => {
    supabase
      .from("pixels")
      .select("*")
      .then(({ data }) => {
        if (data) {
          setPixels(data);
          const tiktokPixel = data.find((p) => p.platform === "tiktok");
          if (tiktokPixel) {
            if (tiktokPixel.pixel_id && !ttPixelId) setTtPixelId(tiktokPixel.pixel_id);
            if (tiktokPixel.api_token) setTtAccessToken(tiktokPixel.api_token);
          }
        }
        setLoading(false);
      });
  }, []);

  const handleTikTokPurchase = async () => {
    if (!ttPixelId.trim() || !ttAccessToken.trim()) {
      toast.error("Preencha o Pixel ID e o Token da API antes de enviar.");
      return;
    }
    setTtSending(true);
    try {
      const value = parseFloat(ttValue.replace(",", ".")) || 0;
      const res = await supabase.functions.invoke("tiktok-purchase-event", {
        body: {
          pixel_id: ttPixelId.trim(),
          access_token: ttAccessToken.trim(),
          value,
          order_id: ttOrderId,
        },
      });

      if (res.error) {
        toast.error("Erro ao enviar evento: " + (res.error.message || "Erro desconhecido"));
      } else {
        toast.success("Evento Purchase enviado com sucesso ao TikTok!");
        setTtOrderId(generateOrderId());
      }
    } catch (err: any) {
      toast.error("Erro ao enviar evento: " + (err.message || "Erro desconhecido"));
    }
    setTtSending(false);
  };

  const handleSave = async (pixel: PixelConfig) => {
    setSaving(pixel.id);
    const { error } = await supabase
      .from("pixels")
      .update({
        pixel_id: pixel.pixel_id,
        api_token: pixel.api_token,
        enabled: pixel.enabled,
      })
      .eq("id", pixel.id);

    if (error) {
      toast.error("Erro ao salvar pixel");
    } else {
      toast.success(`Pixel ${platformConfig[pixel.platform as keyof typeof platformConfig]?.label} salvo com sucesso!`);
    }
    setSaving(null);
  };

  const updatePixel = (id: string, field: keyof PixelConfig, value: string | boolean) => {
    setPixels((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Pixels de Rastreamento</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure os pixels do Facebook Ads e TikTok Ads para rastrear conversões na página de vendas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {pixels.map((pixel) => {
          const config = platformConfig[pixel.platform as keyof typeof platformConfig];
          if (!config) return null;
          const Icon = config.icon;

          return (
            <Card
              key={pixel.id}
              className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm"
              style={{ boxShadow: `0 0 30px ${config.bgGlow}` }}
            >
              {/* Header gradient */}
              <div className={`h-1.5 bg-gradient-to-r ${config.color}`} />

              <div className="p-6 space-y-5">
                {/* Title + Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${config.color} text-white`}>
                      <Icon />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{config.label}</h3>
                      <p className="text-xs text-muted-foreground">
                        {pixel.enabled ? "Ativo na página de vendas" : "Desativado"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={pixel.enabled}
                    onCheckedChange={(v) => updatePixel(pixel.id, "enabled", v)}
                  />
                </div>

                {/* Pixel ID */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-medium">Pixel ID</Label>
                  <Input
                    placeholder={`ID do pixel ${config.label}`}
                    value={pixel.pixel_id}
                    onChange={(e) => updatePixel(pixel.id, "pixel_id", e.target.value)}
                    className="bg-muted/50 border-border/50"
                  />
                </div>

                {/* API Token */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-medium">Token da API (Conversions API)</Label>
                  <Input
                    placeholder="Token de acesso"
                    value={pixel.api_token}
                    onChange={(e) => updatePixel(pixel.id, "api_token", e.target.value)}
                    className="bg-muted/50 border-border/50"
                    type="password"
                  />
                </div>

                {/* Save */}
                <Button
                  onClick={() => handleSave(pixel)}
                  disabled={saving === pixel.id}
                  className={`w-full bg-gradient-to-r ${config.color} text-white hover:opacity-90`}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving === pixel.id ? "Salvando..." : "Salvar configuração"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* TikTok Purchase Activator */}
      <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="h-1.5 bg-gradient-to-r from-pink-500 to-violet-500" />
        <div className="p-6 space-y-5">
          <div>
            <h3 className="font-semibold text-foreground text-lg">Ativador Manual de Pixel TikTok</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Dispare eventos de teste (Purchase) diretamente para o TikTok Ads sem afetar pedidos reais.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground font-medium">Pixel ID</Label>
            <Input
              placeholder="Ex: D6V0LGRC77U78B5PP8EG"
              value={ttPixelId}
              onChange={(e) => setTtPixelId(e.target.value)}
              className="bg-muted/50 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground font-medium">Token da API (Access Token)</Label>
            <Input
              placeholder="Token de acesso do TikTok"
              value={ttAccessToken}
              onChange={(e) => setTtAccessToken(e.target.value)}
              className="bg-muted/50 border-border/50"
              type="password"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground font-medium">Valor da Compra (R$)</Label>
            <Input
              placeholder="97,90"
              value={ttValue}
              onChange={(e) => setTtValue(e.target.value)}
              className="bg-muted/50 border-border/50"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground font-medium">Order ID</Label>
            <Input
              value={ttOrderId}
              onChange={(e) => setTtOrderId(e.target.value)}
              className="bg-muted/50 border-border/50"
            />
            <p className="text-xs text-muted-foreground">Gerado automaticamente. Altere se necessário.</p>
          </div>

          <Button
            onClick={handleTikTokPurchase}
            disabled={ttSending || !ttPixelId.trim()}
            className="w-full bg-gradient-to-r from-red-500 to-red-400 text-white hover:opacity-90 h-12 text-base font-semibold"
          >
            <Send className="h-5 w-5" />
            Enviar Evento Purchase
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Este evento não será salvo no banco de dados de pedidos.
          </p>
        </div>
      </Card>

      <Card className="border-border/30 bg-muted/20 p-4">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Como funciona:</strong> Os pixels configurados aqui serão carregados automaticamente na página de vendas principal com o evento <code className="bg-muted px-1.5 py-0.5 rounded text-primary">PageView</code>. Os tokens da API são usados para a Conversions API (servidor) para melhor rastreamento.
        </p>
      </Card>
    </div>
  );
}
