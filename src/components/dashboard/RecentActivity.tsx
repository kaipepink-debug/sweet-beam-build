import { cn } from "@/lib/utils";
import { Download, RotateCcw, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const transactions = [
  { name: "TSLA", company: "Tesla, Inc.", amount: "R$ 30.017,23", date: "Dez 13, 2026", status: "Processing", executor: { name: "Olivia Rhye", email: "olivia@company.com", initials: "OR" } },
  { name: "MTCH", company: "Match Group, Inc.", amount: "R$ 10.045,00", date: "Dez 13, 2026", status: "Success", executor: { name: "Phoenix Baker", email: "phoenix@company.com", initials: "PB" } },
  { name: "DDOG", company: "Datadog Inc.", amount: "R$ 40.132,18", date: "Dez 13, 2026", status: "Serious", executor: { name: "Lana Steiner", email: "lana@company.com", initials: "LS" } },
  { name: "ARKG", company: "ARK Genomic Rev ETF", amount: "R$ 22.865,12", date: "Dez 28, 2026", status: "Declined", executor: { name: "Demi Wilkinson", email: "demi@company.com", initials: "DW" } },
];

const statusStyles: Record<string, string> = {
  Processing: "text-yellow-400 bg-yellow-400/10",
  Success: "text-emerald-400 bg-emerald-400/10",
  Serious: "text-red-400 bg-red-400/10",
  Declined: "text-muted-foreground bg-muted",
};

export function RecentActivity() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Histórico de Transações</h3>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-lg px-3 py-1.5 hover:text-foreground transition-colors">
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
          <button className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground rounded-lg px-3 py-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            Re-issue
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs text-muted-foreground font-medium py-2.5 pr-4">Nome do Produto</th>
              <th className="text-left text-xs text-muted-foreground font-medium py-2.5 pr-4">Valor</th>
              <th className="text-left text-xs text-muted-foreground font-medium py-2.5 pr-4">Data</th>
              <th className="text-left text-xs text-muted-foreground font-medium py-2.5 pr-4">Status</th>
              <th className="text-left text-xs text-muted-foreground font-medium py-2.5 pr-4">Executado por</th>
              <th className="text-right text-xs text-muted-foreground font-medium py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, i) => (
              <tr key={i} className="border-b border-border/50 last:border-0">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-foreground">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-foreground font-medium text-xs">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground">{t.company}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4 text-foreground text-xs">{t.amount}</td>
                <td className="py-3 pr-4 text-muted-foreground text-xs">{t.date}</td>
                <td className="py-3 pr-4">
                  <span className={cn("text-[10px] px-2.5 py-1 rounded-full font-medium", statusStyles[t.status])}>
                    {t.status}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary/20 text-primary text-[9px]">{t.executor.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs text-foreground">{t.executor.name}</p>
                      <p className="text-[10px] text-muted-foreground">{t.executor.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-right">
                  <button className="text-xs text-primary hover:underline">More</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
