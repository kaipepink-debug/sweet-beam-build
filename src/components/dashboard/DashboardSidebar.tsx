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
      className="fixed left-0 top-0 bottom-0 w-[60px] hover:w-[220px] z-40 flex flex-col py-4 gap-1 transition-all duration-300 overflow-hidden group/sidebar border-r border-border/20 hover:border-border/40"
      style={{
        background: "linear-gradient(180deg, hsl(240 50% 5% / 0.45) 0%, hsl(260 60% 8% / 0.4) 100%)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
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
                "h-10 rounded-xl flex items-center gap-3 px-[10px] transition-all duration-300 whitespace-nowrap relative",
                isActive
                  ? "bg-primary/20 text-primary shadow-[0_0_18px_hsl(270_100%_55%/0.3)]"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-[0_0_15px_hsl(270_100%_55%/0.2)]"
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2.5} />
              <span className="text-[13px] font-bold opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
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
