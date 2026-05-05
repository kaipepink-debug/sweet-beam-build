import { Activity, CreditCard, LayoutGrid, LineChart, Mail, Settings, ShoppingBag, Sparkles, Users2, Sun, Moon, Bell, LogOut, Image, KeyRound, Crosshair, Video, Handshake, LogIn, GraduationCap } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import ratariaLogo from "@/assets/rataria-icon.png";
import ratariaLogoBlack from "@/assets/rataria-icon-black.png";
import { usePermissions } from "@/hooks/usePermissions";
import { useRole } from "@/hooks/useRole";
import { useProfile } from "@/hooks/useProfile";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutGrid, permKey: "dashboard" },
  { title: "Assinaturas", url: "/dashboard/assinaturas", icon: Activity, permKey: "assinaturas" },
  { title: "Financeiro", url: "/dashboard/financeiro", icon: CreditCard, permKey: "financeiro" },
  { title: "Vendas", url: "/dashboard/vendas", icon: ShoppingBag, permKey: "vendas" },
  { title: "Clientes", url: "/dashboard/clientes", icon: Users2, permKey: "clientes" },
  { title: "E-mail - Acesso", url: "/dashboard/gmail", icon: Mail, permKey: "email_acesso" },
  { title: "Ferramentas IA", url: "/dashboard-ferramentas", icon: Sparkles, permKey: "ferramentas_ia" },
  { title: "Gerar Avisos", url: "/dashboard/gerar-avisos", icon: Image, permKey: "gerar_avisos" },
  { title: "Acesso Clientes", url: "/dashboard/acesso-clientes", icon: KeyRound, permKey: "acesso_clientes" },
  { title: "Pixels", url: "/dashboard/pixels", icon: Crosshair, permKey: "pixels" },
  { title: "VTurb", url: "/dashboard/vturb", icon: Video, permKey: "dashboard" },
  { title: "Logins Painel", url: "/dashboard/logins", icon: LogIn, permKey: "dashboard" },
  { title: "Área de Membros", url: "/dashboard/area-membros", icon: GraduationCap, permKey: "dashboard" },
  { title: "Analytics", url: "/dashboard/analytics", icon: LineChart, permKey: "analytics" },
  { title: "Equipe", url: "/dashboard-equipe", icon: Users2, permKey: "equipe" },
  { title: "Afiliados", url: "/dashboard/afiliados", icon: Handshake, permKey: "afiliados" },
  { title: "Configurações", url: "/dashboard/configuracoes", icon: Settings, permKey: "configuracoes" },
];

export function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { permissions, loading } = usePermissions();
  const { isAdmin, loading: roleLoading } = useRole();
  const { displayName } = useProfile();
  const [isLight, setIsLight] = useState(document.documentElement.classList.contains("light"));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(document.documentElement.classList.contains("light"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const newIsLight = !isLight;
    if (newIsLight) {
      root.classList.add("light");
      localStorage.setItem("dashboard-theme", "light");
    } else {
      root.classList.remove("light");
      localStorage.setItem("dashboard-theme", "dark");
    }
    setIsLight(newIsLight);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const initials = displayName
    ? displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-[220px] z-40 flex flex-col py-4 gap-1 border-r border-border bg-sidebar-background/95 backdrop-blur-xl"
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
      <nav className="flex-1 flex flex-col gap-0.5 w-full px-2 overflow-auto">
        {loading && !isAdmin ? null : menuItems.map((item) => {
          const isAreaMembros = item.url === "/dashboard/area-membros";
          const hasPermission = item.permKey === "afiliados"
            ? (isAdmin || (permissions as any).afiliados)
            : isAreaMembros
              ? (isAdmin || permissions.dashboard || (permissions as any).is_afiliado)
              : (isAdmin || permissions[item.permKey as keyof typeof permissions]);
          if (!hasPermission) return null;

          const isActive = location.pathname === item.url || (item.url === "/dashboard-ferramentas" && location.pathname.startsWith("/dashboard-ferramentas/") && location.pathname !== "/dashboard/gerar-avisos");

          return (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                "h-10 rounded-xl flex items-center gap-3 px-[10px] transition-all duration-300 whitespace-nowrap relative",
                isActive
                  ? "bg-primary/20 text-primary shadow-[0_0_18px_hsl(270_100%_55%/0.3)]"
                  : "text-sidebar-foreground hover:text-primary hover:bg-primary/10 hover:shadow-[0_0_15px_hsl(270_100%_55%/0.2)]"
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
              <span className="text-[13px] font-medium">{item.title}</span>
              {isActive && (
                <div className="absolute left-0 w-[3px] h-5 rounded-r-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className="mt-auto px-3 pt-2 border-t border-border/40">
        <div className="flex items-center justify-between">
          <button
            onClick={handleLogout}
            className="text-sidebar-foreground hover:text-destructive transition-colors p-2 rounded-lg hover:bg-muted/50"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>

          <button
            onClick={toggleTheme}
            className="text-sidebar-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/50"
            title={isLight ? "Modo escuro" : "Modo claro"}
          >
            {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          <button className="relative text-sidebar-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/50">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </button>

          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-semibold">{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </aside>
  );
}
