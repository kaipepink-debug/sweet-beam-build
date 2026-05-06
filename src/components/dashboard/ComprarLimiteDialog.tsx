import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Copy, Loader2, CheckCircle2, QrCode } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onPaid?: (novoLimite: number) => void;
}

const STORAGE_KEY = "comprar_limite_pix_v1";

function priceFor(qty: number) {
  const unit = qty > 10 ? 40 : 45;
  return { unit, total: unit * qty };
}

export default function ComprarLimiteDialog({ open, onOpenChange, onPaid }: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState<"form" | "pix">("form");
  const [qty, setQty] = useState(1);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [pix, setPix] = useState<{ paymentId: string; qrCode: string; copyPasteCode: string; amount: number; qty: number } | null>(null);
  const [paid, setPaid] = useState(false);

  const { unit, total } = priceFor(qty);

  // Restaura PIX pendente do localStorage ao montar/abrir
  useEffect(() => {
    if (!user) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        if (p && p.paymentId && p.userId === user.id) {
          setPix({ paymentId: p.paymentId, qrCode: p.qrCode, copyPasteCode: p.copyPasteCode, amount: p.amount, qty: p.qty });
          setQty(p.qty);
          setStep("pix");
        }
      }
    } catch {}
  }, [user]);

  // Carrega CPF/nome do perfil ao abrir
  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("cpf, display_name").eq("user_id", user.id).maybeSingle();
      if (data?.cpf) setCpf(data.cpf);
      if (data?.display_name && !nome) setNome(data.display_name);
    })();
  }, [open, user]);

  // Polling do pagamento — roda mesmo com o dialog fechado
  useEffect(() => {
    if (step !== "pix" || !pix || paid) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("check-limite-payment", {
          body: { paymentId: pix.paymentId },
        });
        if (cancelled) return;
        if (!error && data?.status === "paid") {
          setPaid(true);
          localStorage.removeItem(STORAGE_KEY);
          toast.success("Pagamento efetuado! Seu limite foi liberado.", { duration: 6000 });
          onPaid?.(data.novoLimite);
          // Garante que o dialog abra para mostrar a confirmação
          onOpenChange(true);
        }
      } catch { /* ignore */ }
    };
    const interval = setInterval(tick, 5000);
    tick();
    return () => { cancelled = true; clearInterval(interval); };
  }, [step, pix, paid, onPaid, onOpenChange]);

  const formatCpf = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    return d.replace(/^(\d{3})(\d)/, "$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
  };

  const handleGerar = async () => {
    if (!nome.trim()) { toast.error("Informe seu nome"); return; }
    const cpfDigits = cpf.replace(/\D/g, "");
    if (cpfDigits.length !== 11) { toast.error("CPF inválido"); return; }
    if (qty < 1) { toast.error("Quantidade inválida"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("buy-limite-pix", {
        body: { qty, nome, cpf: cpfDigits },
      });
      if (error || !data?.success) {
        toast.error(data?.error || error?.message || "Erro ao gerar PIX");
        return;
      }
      const newPix = { paymentId: data.paymentId, qrCode: data.qrCode, copyPasteCode: data.copyPasteCode, amount: data.amount, qty: data.qty };
      setPix(newPix);
      setStep("pix");
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...newPix, userId: user?.id })); } catch {}
    } finally { setLoading(false); }
  };

  const handleClose = (o: boolean) => {
    onOpenChange(o);
    if (!o && paid) {
      // limpa estado após sucesso
      setPaid(false); setPix(null); setStep("form");
    }
  };

  const copyCode = () => {
    if (!pix) return;
    navigator.clipboard.writeText(pix.copyPasteCode);
    toast.success("Código PIX copiado");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{paid ? "Limite liberado!" : step === "form" ? "Comprar limite de assinaturas" : "Pague via PIX"}</DialogTitle>
        </DialogHeader>

        {step === "form" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-xs">
              <p className="font-semibold text-foreground mb-1">Tabela de preços</p>
              <p className="text-muted-foreground">Até 10 limites: <strong className="text-foreground">R$ 45,00</strong> cada</p>
              <p className="text-muted-foreground">A partir de 11: <strong className="text-foreground">R$ 40,00</strong> cada</p>
            </div>

            <div>
              <Label className="text-xs">Quantidade de limites</Label>
              <Input type="number" min={1} max={1000} value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))} className="text-base" />
            </div>

            <div>
              <Label className="text-xs">Nome completo</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} className="text-base" />
            </div>

            <div>
              <Label className="text-xs">CPF</Label>
              <Input value={cpf} onChange={(e) => setCpf(formatCpf(e.target.value))} placeholder="000.000.000-00" className="text-base" />
            </div>

            <div className="rounded-lg bg-muted/30 border border-border p-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total a pagar</span>
              <span className="text-lg font-bold text-primary">R$ {total.toFixed(2).replace(".", ",")}</span>
            </div>

            <Button onClick={handleGerar} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gerar PIX"}
            </Button>
          </div>
        )}

        {step === "pix" && pix && !paid && (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/30 border border-border p-3 text-center">
              <p className="text-xs text-muted-foreground">Você está comprando</p>
              <p className="text-base font-bold text-foreground">{pix.qty} limites por R$ {pix.amount.toFixed(2).replace(".", ",")}</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(pix.copyPasteCode)}`}
                alt="QR Code PIX"
                className="w-[220px] h-[220px]"
              />
            </div>

            <div>
              <Label className="text-xs">PIX Copia e Cola</Label>
              <div className="flex gap-2">
                <Input readOnly value={pix.copyPasteCode} className="text-xs font-mono" />
                <Button size="icon" variant="outline" onClick={copyCode}><Copy className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Aguardando pagamento...
            </div>
          </div>
        )}

        {paid && (
          <div className="space-y-4 text-center py-4">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
            <p className="text-sm text-foreground">Seu limite foi aumentado com sucesso.</p>
            <Button onClick={() => onOpenChange(false)} className="w-full">Fechar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
