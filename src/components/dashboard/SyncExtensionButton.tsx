import { useState } from "react";
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { isExtensionInstalled, syncExtension, SUPPORTED_TOOLS } from "@/lib/syncExtension";

interface SyncExtensionButtonProps {
  variant?: "default" | "outline";
  className?: string;
}

export default function SyncExtensionButton({
  variant = "outline",
  className = "",
}: SyncExtensionButtonProps) {
  const [syncing, setSyncing] = useState(false);

  async function handleSync() {
    if (syncing) return;
    setSyncing(true);
    try {
      const installed = await isExtensionInstalled();
      if (!installed) {
        toast.error("Extensão não detectada", {
          description: "Instale a extensão da RatarIA no seu navegador.",
        });
        return;
      }
      const result = await syncExtension();
      if (!result.ok) {
        toast.error("Falha na sincronização", { description: result.error });
        return;
      }
      const total = Object.values(result.credentialsCount || {}).reduce((s, n) => s + n, 0);
      const tools = Object.entries(result.credentialsCount || {})
        .filter(([, n]) => n > 0)
        .map(([k, n]) => `${k} (${n})`)
        .join(", ");
      toast.success("Sincronizado com a extensão", {
        description: total === 0
          ? `Nenhuma conta válida pra ${SUPPORTED_TOOLS.join("/")} cadastrada ainda.`
          : `${total} ${total === 1 ? "conta" : "contas"} enviadas: ${tools}${result.proxyApplied ? " · proxy ativo" : ""}`,
      });
    } catch (e) {
      toast.error("Erro ao sincronizar", { description: (e as Error).message });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <Button
      variant={variant}
      onClick={handleSync}
      disabled={syncing}
      className={`gap-2 border-violet-500/30 text-violet-300 hover:bg-violet-500/10 hover:text-violet-200 ${className}`}
      title="Envia credenciais e 2FA pra extensão deste navegador"
    >
      <RefreshCcw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
      {syncing ? "Sincronizando..." : "Sincronizar extensão"}
    </Button>
  );
}
