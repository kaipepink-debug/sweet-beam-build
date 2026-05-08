import { Megaphone, Images, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const CRIATIVOS_URL = "https://drive.google.com/drive/folders/1fYq3PUaFafTCQPZUeAveK0AoiEJSZ6rg?usp=drive_link";
const COPY_WPP_URL = "https://docs.google.com/document/d/1VLkWwTkdARQcrYstK-64caUo5kxWZ2HKHlRBASgBgT8/edit?usp=drive_link";

export default function DashboardMateriais() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Megaphone className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Materiais de Divulgação</h1>
          <p className="text-sm text-muted-foreground">Acesse criativos e copies prontos para divulgar</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6 flex flex-col gap-4 border-border/60 hover:border-primary/50 transition-colors">
          <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center">
            <Images className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-1">Criativos</h2>
            <p className="text-sm text-muted-foreground">
              Banners, vídeos e imagens prontos para usar nas suas campanhas.
            </p>
          </div>
          <Button asChild className="w-full">
            <a href={CRIATIVOS_URL} target="_blank" rel="noopener noreferrer">
              Acessar Criativos <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </Card>

        <Card className="p-6 flex flex-col gap-4 border-border/60 hover:border-primary/50 transition-colors">
          <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-1">Copy de Vendas - WhatsApp</h2>
            <p className="text-sm text-muted-foreground">
              Scripts e mensagens validadas para conversão no WhatsApp.
            </p>
          </div>
          <Button asChild className="w-full">
            <a href={COPY_WPP_URL} target="_blank" rel="noopener noreferrer">
              Acessar Copy de Vendas <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </Card>
      </div>
    </div>
  );
}
