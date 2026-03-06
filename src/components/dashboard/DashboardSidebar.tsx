import { BarChart3, CreditCard, Eye, LayoutDashboard, Settings, ShoppingCart, Users, Wrench } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import ratariaLogo from "@/assets/rataria-icon.png";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Eye },
  { title: "Financeiro", url: "/dashboard/financeiro", icon: CreditCard },
  { title: "Vendas", url: "/dashboard/vendas", icon: ShoppingCart },
  { title: "Assinaturas", url: "/dashboard/assinaturas", icon: LayoutDashboard },
  { title: "Clientes", url: "/dashboard/clientes", icon: Users },
  { title: "Ferramentas IA", url: "/dashboard/ferramentas", icon: Wrench },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Configurações", url: "/dashboard/configuracoes", icon: Settings },
];

export function DashboardSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[60px] z-40 flex flex-col items-center py-4 gap-1"
      style={{
        background: "linear-gradient(180deg, hsl(240 50% 5% / 0.95) 0%, hsl(260 60% 8% / 0.9) 100%)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Logo */}
      <div className="mb-4">
        <img src={ratariaLogo} alt="Ratar.ia" className="w-9 h-9 rounded-xl" />
      </div>

      {/* Menu items */}
      <nav className="flex-1 flex flex-col items-center gap-1 w-full px-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <Link
              key={item.title}
              to={item.url}
              title={item.title}
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 group relative",
                isActive
                  ? "bg-foreground text-background shadow-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              <item.icon className="h-4 w-4" />
              {/* Tooltip */}
              <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-card border border-border text-xs text-foreground font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl z-50">
                {item.title}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom glow */}
      <div
        className="w-10 h-10 rounded-full blur-2xl opacity-40 mt-auto"
        style={{ background: "radial-gradient(circle, hsl(270 100% 55%), transparent)" }}
      />
    </aside>
  );
}
