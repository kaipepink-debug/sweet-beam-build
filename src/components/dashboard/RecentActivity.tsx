import { cn } from "@/lib/utils";

const sales = [
  { client: "Ana Silva", plan: "Anual", value: "R$ 997,00", status: "Aprovado", date: "05/03/2026" },
  { client: "Carlos Mendes", plan: "Mensal", value: "R$ 97,00", status: "Aprovado", date: "04/03/2026" },
  { client: "Beatriz Lima", plan: "Semestral", value: "R$ 497,00", status: "Pendente", date: "04/03/2026" },
  { client: "Rafael Costa", plan: "Anual", value: "R$ 997,00", status: "Aprovado", date: "03/03/2026" },
  { client: "Juliana Rocha", plan: "Mensal", value: "R$ 97,00", status: "Recusado", date: "03/03/2026" },
];

const statusStyles: Record<string, string> = {
  Aprovado: "text-emerald-400 bg-emerald-400/10",
  Pendente: "text-yellow-400 bg-yellow-400/10",
  Recusado: "text-red-400 bg-red-400/10",
};

export function RecentActivity() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-foreground">Atividade Recente</h3>
        <p className="text-xs text-muted-foreground mt-1">Últimas 5 vendas</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs text-muted-foreground font-medium py-2 pr-4">Cliente</th>
              <th className="text-left text-xs text-muted-foreground font-medium py-2 pr-4">Plano</th>
              <th className="text-left text-xs text-muted-foreground font-medium py-2 pr-4">Valor</th>
              <th className="text-left text-xs text-muted-foreground font-medium py-2 pr-4">Status</th>
              <th className="text-left text-xs text-muted-foreground font-medium py-2">Data</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale, i) => (
              <tr key={i} className="border-b border-border/50 last:border-0">
                <td className="py-3 pr-4 text-foreground">{sale.client}</td>
                <td className="py-3 pr-4 text-muted-foreground">{sale.plan}</td>
                <td className="py-3 pr-4 text-foreground font-medium">{sale.value}</td>
                <td className="py-3 pr-4">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusStyles[sale.status])}>
                    {sale.status}
                  </span>
                </td>
                <td className="py-3 text-muted-foreground">{sale.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
