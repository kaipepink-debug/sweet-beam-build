import { MoreHorizontal } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const countries = [
  { name: "Brasil", flag: "🇧🇷", percentage: 85 },
  { name: "Portugal", flag: "🇵🇹", percentage: 70 },
  { name: "Angola", flag: "🇦🇴", percentage: 45 },
  { name: "Moçambique", flag: "🇲🇿", percentage: 38 },
];

export function SessionByCountry() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-foreground">Sessões por País</h3>
        <button className="text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-5">
        {countries.map((country) => (
          <div key={country.name} className="flex items-center gap-3">
            <span className="text-lg">{country.flag}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-foreground">{country.name}</span>
                <span className="text-xs text-muted-foreground">{country.percentage}%</span>
              </div>
              <Progress value={country.percentage} className="h-1.5 bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
