import { Activity, CreditCard, LayoutGrid, LineChart, Settings, ShoppingBag, Sparkles, Users2 } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import ratariaLogo from "@/assets/rataria-icon.png";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutGrid },
  { title: "Financeiro", url: "/dashboard/financeiro", icon: CreditCard },
  { title: "Vendas", url: "/dashboard/vendas", icon: ShoppingBag },
  { title: "Assinaturas", url: "/dashboard/assinaturas", icon: Activity },
  { title: "Clientes", url: "/dashboard/clientes", icon: Users2 },
  { title: "Ferramentas IA", url: "/dashboard/ferramentas", icon: Sparkles },
  { title: "Analytics", url: "/dashboard/analytics", icon: LineChart },
  { title: "Configurações", url: "/dashboard/configuracoes", icon: Settings },
];

export function DashboardSidebar() {
  const location = useLocation();

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-[60px] hover:w-[220px] z-40 flex flex-col py-4 gap-1 transition-all duration-300 overflow-hidden group/sidebar"
      style={{
        background: "linear-gradient(180deg, hsl(240 50% 5% / 0.95) 0%, hsl(260 60% 8% / 0.9) 100%)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-[14px] mb-4 min-h-[36px]">
        <img src={ratariaLogo} alt="Ratar.ia" className="w-8 h-8 rounded-xl shrink-0" />
        <span className="text-sm font-bold text-foreground whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
          Ratar.ia
        </span>
      </div>

      {/* Menu items */}
      <nav className="flex-1 flex flex-col gap-0.5 w-full px-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                "h-10 rounded-xl flex items-center gap-3 px-[10px] transition-all duration-200 whitespace-nowrap",
                isActive
                  ? "bg-primary/15 text-primary shadow-lg shadow-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              <span className="text-[13px] font-medium opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
                {item.title}
              </span>
              {isActive && (
                <div className="absolute left-0 w-[3px] h-5 rounded-r-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom glow */}
      <div
        className="w-10 h-10 rounded-full blur-2xl opacity-40 mt-auto self-center"
        style={{ background: "radial-gradient(circle, hsl(270 100% 55%), transparent)" }}
      />
    </aside>
  );
}
