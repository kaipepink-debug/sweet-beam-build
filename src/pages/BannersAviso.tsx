import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Download, RefreshCw, Pencil, Send, Trash2, Copy, Plus, X, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

type BannerType = "novidade" | "restabelecida" | "manutencao" | "geral" | "senha_alterada";

interface Ferramenta {
  id: string;
  nome: string;
  logo_url: string | null;
  cor_tema: string;
}

const bannerTypes = [
  { value: "novidade" as BannerType, label: "Novidade em Ferramenta", icon: "🆕", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { value: "restabelecida" as BannerType, label: "Ferramenta Restabelecida", icon: "✅", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "manutencao" as BannerType, label: "Em Manutenção", icon: "🔴", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  { value: "geral" as BannerType, label: "Aviso Geral", icon: "📢", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { value: "senha_alterada" as BannerType, label: "Senha Alterada", icon: "🔑", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
];

export default function BannersAviso() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<BannerType>("novidade");
  const [ferramentaId, setFerramentaId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [textoDestaque, setTextoDestaque] = useState("");
  const [textoRodape, setTextoRodape] = useState("");
  const [motivo, setMotivo] = useState("");
  const [previsao, setPrevisao] = useState("");
  const [descricao, setDescricao] = useState("");
  const [printFile, setPrintFile] = useState<File | null>(null);
  const [printPreview, setPrintPreview] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [promptUsado, setPromptUsado] = useState("");
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFerramentaDialog, setShowFerramentaDialog] = useState(false);
  const [newFerramentaNome, setNewFerramentaNome] = useState("");
  const [newFerramentaCor, setNewFerramentaCor] = useState("#7C3AED");
  const [newFerramentaLogo, setNewFerramentaLogo] = useState<File | null>(null);

  // Fetch ferramentas
  const { data: ferramentas = [] } = useQuery({
    queryKey: ["ferramentas_banner"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ferramentas_banner").select("*").order("nome");
      if (error) throw error;
      return data as Ferramenta[];
    },
  });

  // Fetch histórico
  const { data: historico = [] } = useQuery({
    queryKey: ["banners_historico"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners_historico")
        .select("*, ferramentas_banner(nome, cor_tema)")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const selectedFerramenta = ferramentas.find((f) => f.id === ferramentaId);

  // Handle print upload
  const handlePrintUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPrintFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPrintPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Build prompt
  const buildPrompt = (): string => {
    const baseBanner = `Create a professional social media banner image (1080x1350px portrait) with a dark tech/futuristic aesthetic. The background should be very dark (#0D0D0F to #1A1A2E) with subtle circuit board patterns, geometric shapes, and particle effects. Use purple/violet accent colors (#7C3AED, #A855F7). The banner should have the text "ratar.IA" as a small logo at the top center. Use bold sans-serif typography (like Inter or Montserrat). Add subtle gradient effects, glow borders, and soft shadows for depth.`;

    switch (selectedType) {
      case "novidade":
        return `${baseBanner}

This is a "NEW FEATURE" announcement banner for the AI tool "${selectedFerramenta?.nome || ""}".
- Show the tool name "${selectedFerramenta?.nome || ""}" prominently with a glow effect in color ${selectedFerramenta?.cor_tema || "#7C3AED"}
- Main title text: "${titulo}"
- Highlight text at the top: "${textoDestaque || "NOVIDADE EXCLUSIVA NO AR! ⚡"}"
- Footer text: "${textoRodape || ""}"
- Include a green "NOVO" badge/tag (#22C55E)
- The center area should have a stylized device frame/mockup with a glowing border where a screenshot would go
- Make it look exciting and premium`;

      case "restabelecida":
        return `${baseBanner}

This is a "TOOL RESTORED" announcement banner for the AI tool "${selectedFerramenta?.nome || ""}".
- Show the tool name "${selectedFerramenta?.nome || ""}" prominently with a glow effect in color ${selectedFerramenta?.cor_tema || "#7C3AED"}
- Main highlight text: "${textoDestaque || "FERRAMENTA RESTABELECIDA ✅"}"
- Use a green checkmark or success indicator (#22C55E)
- Include a celebratory but professional tone
- ${descricao ? `Additional message: "${descricao}"` : ""}
- Make it look reassuring and positive`;

      case "manutencao":
        return `${baseBanner}

This is a "MAINTENANCE" notice banner for the AI tool "${selectedFerramenta?.nome || ""}".
- Show the tool name "${selectedFerramenta?.nome || ""}" prominently with a glow effect in color ${selectedFerramenta?.cor_tema || "#7C3AED"}
- Main highlight text: "EM MANUTENÇÃO 🔴"
- Use a red/orange warning indicator
- Reason: "${motivo}"
- ${previsao ? `Estimated return: "${previsao}"` : ""}
- Make it look informative but not alarming, professional maintenance notice`;

      case "geral":
        return `${baseBanner}

This is a "GENERAL ANNOUNCEMENT" banner for the platform.
- Main title: "${titulo}"
- Description/message: "${descricao}"
- Use a megaphone or announcement icon element
- Make it look official and attention-grabbing
- ${textoDestaque ? `Highlight: "${textoDestaque}"` : ""}`;

      case "senha_alterada":
        return `${baseBanner}

This is a "PASSWORD CHANGED" notice banner for the AI tool "${selectedFerramenta?.nome || ""}".
- Show the tool name "${selectedFerramenta?.nome || ""}" prominently with a glow effect in color ${selectedFerramenta?.cor_tema || "#7C3AED"}
- Main highlight text: "SENHA ALTERADA 🔑"
- Include a key or lock icon element with orange/amber accent color
- ${descricao ? `New instructions or message: "${descricao}"` : ""}
- ${textoDestaque ? `Highlight: "${textoDestaque}"` : ""}
- Make it look important and attention-grabbing, professional password change notice
- Include visual cues like a key icon, lock symbol, or shield to represent security`;

      default:
        return baseBanner;
    }
  };

  // Generate banner
  const handleGenerate = async (customPrompt?: string) => {
    setIsGenerating(true);
    try {
      const prompt = customPrompt || buildPrompt();
      setPromptUsado(prompt);

      const images: { data: string; mimeType: string }[] = [];

      // Add print screenshot if available
      if (printFile && printPreview) {
        const base64 = printPreview.split(",")[1];
        images.push({ data: base64, mimeType: printFile.type });
      }

      const { data, error } = await supabase.functions.invoke("generate-banner", {
        body: { prompt, images: images.length > 0 ? images : undefined },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const imageBase64 = data.image;
      setGeneratedImage(`data:image/png;base64,${imageBase64}`);

      // Upload to storage and save to history
      const fileName = `banner_${Date.now()}.png`;
      const blob = await fetch(`data:image/png;base64,${imageBase64}`).then((r) => r.blob());

      const { error: uploadError } = await supabase.storage.from("banners").upload(fileName, blob, { contentType: "image/png" });

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("banners").getPublicUrl(fileName);

        await supabase.from("banners_historico").insert({
          tipo: selectedType,
          ferramenta_id: ferramentaId || null,
          titulo: titulo || textoDestaque || motivo,
          dados: { textoDestaque, textoRodape, motivo, previsao, descricao },
          imagem_url: urlData.publicUrl,
          prompt_usado: prompt,
          created_by: user!.id,
        });

        queryClient.invalidateQueries({ queryKey: ["banners_historico"] });
      }

      toast.success("Banner gerado com sucesso!");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erro ao gerar o banner");
    } finally {
      setIsGenerating(false);
    }
  };

  // Download banner
  const handleDownload = () => {
    if (!generatedImage) return;
    const a = document.createElement("a");
    a.href = generatedImage;
    a.download = `banner_${selectedType}_${Date.now()}.png`;
    a.click();
  };

  // Delete from history
  const deleteBanner = async (id: string, imageUrl?: string) => {
    if (imageUrl) {
      const path = imageUrl.split("/banners/")[1];
      if (path) await supabase.storage.from("banners").remove([path]);
    }
    await supabase.from("banners_historico").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["banners_historico"] });
    toast.success("Banner excluído");
  };

  // Add ferramenta
  const handleAddFerramenta = async () => {
    if (!newFerramentaNome.trim()) return;

    let logoUrl = null;
    if (newFerramentaLogo) {
      const fileName = `logos/${Date.now()}_${newFerramentaLogo.name}`;
      const { error } = await supabase.storage.from("banners").upload(fileName, newFerramentaLogo);
      if (!error) {
        const { data } = supabase.storage.from("banners").getPublicUrl(fileName);
        logoUrl = data.publicUrl;
      }
    }

    await supabase.from("ferramentas_banner").insert({
      nome: newFerramentaNome,
      cor_tema: newFerramentaCor,
      logo_url: logoUrl,
    });

    queryClient.invalidateQueries({ queryKey: ["ferramentas_banner"] });
    setNewFerramentaNome("");
    setNewFerramentaCor("#7C3AED");
    setNewFerramentaLogo(null);
    setShowFerramentaDialog(false);
    toast.success("Ferramenta cadastrada!");
  };

  // Delete ferramenta
  const handleDeleteFerramenta = async (id: string) => {
    await supabase.from("ferramentas_banner").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["ferramentas_banner"] });
    toast.success("Ferramenta removida");
  };

  const resetForm = () => {
    setTitulo("");
    setTextoDestaque("");
    setTextoRodape("");
    setMotivo("");
    setPrevisao("");
    setDescricao("");
    setPrintFile(null);
    setPrintPreview(null);
    setGeneratedImage(null);
    setPromptUsado("");
  };

  useEffect(() => {
    resetForm();
  }, [selectedType]);

  const typeConfig = bannerTypes.find((t) => t.value === selectedType)!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Banners Aviso</h1>
          <p className="text-sm text-muted-foreground mt-1">Gere banners padronizados para os canais de avisos da plataforma</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowFerramentaDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Gerenciar Ferramentas
        </Button>
      </div>

      {/* Type Selection */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {bannerTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setSelectedType(type.value)}
            className={`p-4 rounded-xl border transition-all duration-200 text-left ${
              selectedType === type.value
                ? "border-primary bg-primary/10 shadow-[0_0_20px_hsl(270_100%_55%/0.2)]"
                : "border-border/50 bg-card/50 hover:border-border hover:bg-card"
            }`}
          >
            <span className="text-2xl">{type.icon}</span>
            <p className="text-sm font-medium text-foreground mt-2">{type.label}</p>
          </button>
        ))}
      </div>

      {/* Main content: Form + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4 p-5 rounded-xl border border-border/50 bg-card/30">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <span>{typeConfig.icon}</span> {typeConfig.label}
          </h2>

          {/* Ferramenta select (not for geral) */}
          {selectedType !== "geral" && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Ferramenta</Label>
              <Select value={ferramentaId} onValueChange={setFerramentaId}>
                <SelectTrigger><SelectValue placeholder="Selecionar ferramenta..." /></SelectTrigger>
                <SelectContent>
                  {ferramentas.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ background: f.cor_tema }} />
                        {f.nome}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Type-specific fields */}
          {selectedType === "novidade" && (
            <>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Título da Novidade</Label>
                <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder='Ex: "A Integração Kling Video 3.0 Chegou!"' />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Print da Novidade</Label>
                <label className="flex items-center justify-center gap-2 p-4 rounded-lg border border-dashed border-border/60 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{printFile ? printFile.name : "Clique para enviar screenshot"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePrintUpload} />
                </label>
                {printPreview && <img src={printPreview} alt="Preview" className="rounded-lg max-h-40 object-contain" />}
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Texto de destaque (opcional)</Label>
                <Input value={textoDestaque} onChange={(e) => setTextoDestaque(e.target.value)} placeholder="NOVIDADE EXCLUSIVA NO AR! ⚡" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Texto de rodapé (opcional)</Label>
                <Input value={textoRodape} onChange={(e) => setTextoRodape(e.target.value)} placeholder="DISPONÍVEL NO DICLOAK" />
              </div>
            </>
          )}

          {selectedType === "restabelecida" && (
            <>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Texto de destaque</Label>
                <Input value={textoDestaque || "FERRAMENTA RESTABELECIDA ✅"} onChange={(e) => setTextoDestaque(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Mensagem adicional (opcional)</Label>
                <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Mensagem adicional..." />
              </div>
            </>
          )}

          {selectedType === "manutencao" && (
            <>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Motivo resumido</Label>
                <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Manutenção programada no servidor" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Previsão de retorno</Label>
                <Input value={previsao} onChange={(e) => setPrevisao(e.target.value)} placeholder="Previsão: 2h" />
              </div>
            </>
          )}

          {selectedType === "geral" && (
            <>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Título do aviso</Label>
                <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título do comunicado" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Descrição</Label>
                <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição do aviso..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Texto de destaque (opcional)</Label>
                <Input value={textoDestaque} onChange={(e) => setTextoDestaque(e.target.value)} placeholder="Destaque..." />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Imagem opcional</Label>
                <label className="flex items-center justify-center gap-2 p-4 rounded-lg border border-dashed border-border/60 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{printFile ? printFile.name : "Clique para enviar imagem"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePrintUpload} />
                </label>
              </div>
            </>
          )}

          {/* Generate button */}
          <Button onClick={() => handleGenerate()} disabled={isGenerating} className="w-full gap-2 mt-4">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {isGenerating ? "Gerando..." : "Gerar Banner"}
          </Button>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border/50 bg-card/30 overflow-hidden">
            <div className="p-3 border-b border-border/30 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Pré-visualização</span>
              <Badge variant="outline" className={typeConfig.color}>{typeConfig.label}</Badge>
            </div>
            <div className="p-4 flex items-center justify-center min-h-[400px]">
              {generatedImage ? (
                <img src={generatedImage} alt="Banner gerado" className="max-w-full max-h-[500px] rounded-lg shadow-xl object-contain" />
              ) : (
                <div className="text-center text-muted-foreground/50 space-y-2">
                  <div className="w-16 h-20 mx-auto rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                    <span className="text-2xl">🖼️</span>
                  </div>
                  <p className="text-sm">O banner gerado aparecerá aqui</p>
                </div>
              )}
            </div>
          </div>

          {/* Post-generation actions */}
          {generatedImage && (
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleDownload} variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" /> Baixar Banner
              </Button>
              <Button onClick={() => handleGenerate()} variant="outline" size="sm" className="gap-2" disabled={isGenerating}>
                <RefreshCw className="h-4 w-4" /> Gerar Novamente
              </Button>
              <Button onClick={() => setShowPromptEditor(true)} variant="outline" size="sm" className="gap-2">
                <Pencil className="h-4 w-4" /> Editar Prompt
              </Button>
              <Button variant="outline" size="sm" className="gap-2" disabled>
                <Send className="h-4 w-4" /> Enviar para Canal
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Prompt Editor Dialog */}
      <Dialog open={showPromptEditor} onOpenChange={setShowPromptEditor}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Prompt</DialogTitle>
          </DialogHeader>
          <Textarea value={promptUsado} onChange={(e) => setPromptUsado(e.target.value)} rows={12} className="font-mono text-xs" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPromptEditor(false)}>Cancelar</Button>
            <Button onClick={() => { setShowPromptEditor(false); handleGenerate(promptUsado); }}>Gerar com Prompt Editado</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ferramentas Dialog */}
      <Dialog open={showFerramentaDialog} onOpenChange={setShowFerramentaDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ferramentas Cadastradas</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[300px] overflow-auto">
            {ferramentas.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full" style={{ background: f.cor_tema }} />
                  {f.logo_url && <img src={f.logo_url} alt={f.nome} className="w-6 h-6 rounded object-contain" />}
                  <span className="text-sm font-medium">{f.nome}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteFerramenta(f.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
          <div className="border-t border-border/30 pt-4 space-y-3">
            <p className="text-sm font-medium text-foreground">Adicionar nova ferramenta</p>
            <div className="flex gap-2">
              <Input value={newFerramentaNome} onChange={(e) => setNewFerramentaNome(e.target.value)} placeholder="Nome da ferramenta" className="flex-1" />
              <input type="color" value={newFerramentaCor} onChange={(e) => setNewFerramentaCor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" />
            </div>
            <div className="flex gap-2">
              <label className="flex-1 flex items-center gap-2 p-2 rounded-lg border border-dashed border-border/60 cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{newFerramentaLogo ? newFerramentaLogo.name : "Logo (opcional)"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setNewFerramentaLogo(e.target.files?.[0] || null)} />
              </label>
              <Button onClick={handleAddFerramenta} size="sm" className="gap-1">
                <Plus className="h-4 w-4" /> Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Histórico */}
      {historico.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">Histórico de Banners</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {historico.map((banner: any) => {
              const typeInfo = bannerTypes.find((t) => t.value === banner.tipo);
              return (
                <div key={banner.id} className="rounded-xl border border-border/50 bg-card/30 overflow-hidden group">
                  <div className="aspect-[4/5] bg-muted/10 flex items-center justify-center overflow-hidden">
                    {banner.imagem_url ? (
                      <img src={banner.imagem_url} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-muted-foreground/30 text-3xl">🖼️</span>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] ${typeInfo?.color}`}>{typeInfo?.icon} {typeInfo?.label}</Badge>
                    </div>
                    {banner.ferramentas_banner?.nome && (
                      <p className="text-xs text-muted-foreground truncate">{banner.ferramentas_banner.nome}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/60">{new Date(banner.created_at).toLocaleDateString("pt-BR")}</p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {banner.imagem_url && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { const a = document.createElement("a"); a.href = banner.imagem_url; a.download = "banner.png"; a.click(); }}>
                          <Download className="h-3 w-3" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteBanner(banner.id, banner.imagem_url)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
