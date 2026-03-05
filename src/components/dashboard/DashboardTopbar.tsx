import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Calendar, Filter, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = ["Overview", "Notifications", "Trade history"] as const;

interface DashboardTopbarProps {
  activePeriod: string;
  onPeriodChange: (period: string) => void;
}

export function DashboardTopbar({ activePeriod, onPeriodChange }: DashboardTopbarProps) {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-20">
      {/* Top row */}
      <div className="h-14 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 text-xs text-muted-foreground w-48">
            <Search className="h-3.5 w-3.5" />
            <span>Buscar...</span>
            <span className="ml-auto text-[10px] border border-border rounded px-1">⌘K</span>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-primary text-xs">AD</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Bottom row with tabs + filters */}
      <div className="h-10 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={cn(
                "px-3 py-1.5 text-xs rounded-full transition-colors",
                tab === "Overview"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-lg px-3 py-1.5 hover:text-foreground transition-colors">
            <Calendar className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">28 Ago - 15 Dez, 2026</span>
          </button>
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-lg px-3 py-1.5 hover:text-foreground transition-colors">
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filtrar</span>
          </button>
          <button className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground rounded-lg px-3 py-1.5 transition-colors">
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Compartilhar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
