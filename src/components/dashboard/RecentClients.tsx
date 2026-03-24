import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface Client {
  nome: string;
  email: string;
  plano: string;
  valor: number;
  data_criacao: string;
}

export function RecentClients() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("assinantes")
        .select("nome, email, plano, valor, data_criacao")
        .eq("status", "Ativa")
        .order("created_at", { ascending: false })
        .limit(5);
      setClients((data as any[]) ?? []);
    };
    fetch();
  }, []);

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 purple-hover-glow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Clientes Recentes</h3>
      </div>

      <div className="space-y-3">
        {clients.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">Nenhum cliente ainda</p>
        ) : (
          clients.map((c, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/30 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-semibold">
                  {getInitials(c.nome)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-foreground truncate">{c.nome}</p>
                  <span className="text-xs text-foreground font-semibold">R$ {Number(c.valor).toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{c.plano}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(c.data_criacao).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
