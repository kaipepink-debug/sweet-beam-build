import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal } from "lucide-react";

const clients: { name: string; plan: string; value: string; initials: string; date: string }[] = [];

export function RecentClients() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 purple-hover-glow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Clientes Recentes</h3>
        <button className="text-xs text-primary hover:underline">Ver todos</button>
      </div>

      <div className="space-y-3">
        {clients.map((c) => (
          <div key={c.name} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/30 transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-semibold">
                {c.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-foreground truncate">{c.name}</p>
                <span className="text-xs text-foreground font-semibold">{c.value}</span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[10px] text-muted-foreground">{c.plan}</span>
                <span className="text-[10px] text-muted-foreground">{c.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
