import { Activity, CreditCard, LayoutGrid, LineChart, Lock, Mail, Settings, ShoppingBag, Sparkles, Users2 } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import ratariaLogo from "@/assets/rataria-icon.png";
import ratariaLogoBlack from "@/assets/rataria-icon-black.png";
import { usePermissions } from "@/hooks/usePermissions";
import { useProfile } from "@/hooks/useProfile";
import { useState, useEffect } from "react";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutGrid, permKey: "dashboard" },
  { title: "Financeiro", url: "/dashboard/financeiro", icon: CreditCard, permKey: "financeiro" },
  { title: "Vendas", url: "/dashboard/vendas", icon: ShoppingBag, permKey: "vendas" },
  { title: "Assinaturas", url: "/dashboard/assinaturas", icon: Activity, permKey: "assinaturas" },
  { title: "Clientes", url: "/dashboard/clientes", icon: Users2, permKey: "clientes" },
  { title: "E-mail - Acesso", url: "/dashboard/gmail", icon: Mail, permKey: "email_acesso" },
  { title: "Ferramentas IA", url: "/dashboard-ferramentas", icon: Sparkles, permKey: "ferramentas_ia" },
  { title: "Analytics", url: "/dashboard/analytics", icon: LineChart, permKey: "analytics" },
  { title: "Equipe", url: "/dashboard-equipe", icon: Users2, permKey: "equipe" },
  { title: "Configurações", url: "/dashboard/configuracoes", icon: Settings, permKey: "configuracoes" },
];

export function DashboardSidebar() {
  const location = useLocation();
  const { permissions, loading } = usePermissions();
  const { displayName } = useProfile();
  const [isLight, setIsLight] = useState(document.documentElement.classList.contains("light"));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(document.documentElement.classList.contains("light"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-[220px] z-40 flex flex-col py-4 gap-1 border-r border-border/20 bg-sidebar-background/95 backdrop-blur-xl"
    >
      {/* Logo only */}
      <div className="flex items-center justify-center px-4 mb-1 min-h-[44px]">
        <img
          src={isLight ? ratariaLogoBlack : ratariaLogo}
          alt="Ratar.ia"
          className="h-10 shrink-0 object-contain"
        />
      </div>

      {/* Admin greeting */}
      <div className="px-4 mb-3 text-center">
        <p className="text-[11px] text-muted-foreground font-medium">Painel Administrador</p>
        <p className="text-[12px] text-foreground font-semibold truncate">
          Olá, {displayName || "Admin"}
        </p>
      </div>

      {/* Separator */}
      <div className="mx-4 mb-2 border-t border-border/40" />

      {/* Menu items */}
      <nav className="flex-1 flex flex-col gap-0.5 w-full px-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.url;
          const hasPermission = loading ? true : permissions[item.permKey as keyof typeof permissions];

          if (!hasPermission) {
            return (
              <div
                key={item.title}
                className="h-10 rounded-xl flex items-center gap-3 px-[10px] whitespace-nowrap cursor-not-allowed opacity-30"
              >
                <item.icon className="h-[18px] w-[18px] shrink-0 text-muted-foreground" strokeWidth={1.8} />
                <span className="text-[13px] font-medium text-muted-foreground">
                  {item.title}
                </span>
                <Lock className="h-3 w-3 ml-auto shrink-0 text-muted-foreground" />
              </div>
            );
          }

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
              <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
              <span className="text-[13px] font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>
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
