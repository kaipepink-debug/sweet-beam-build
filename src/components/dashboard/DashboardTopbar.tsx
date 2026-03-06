import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Bell } from "lucide-react";

export function DashboardTopbar() {
  return (
    <header className="h-14 border-b border-border bg-background sticky top-0 z-20 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <nav className="hidden md:flex items-center gap-1">
          {["Dashboard", "Financeiro", "Analytics", "Configurações"].map((tab, i) => (
            <button
              key={tab}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                i === 0
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 text-xs text-muted-foreground w-44">
          <Search className="h-3.5 w-3.5" />
          <span>Buscar...</span>
        </div>
        <button className="relative text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
        </button>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">AD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
