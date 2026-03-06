import { BarChart3, CreditCard, Eye, LayoutDashboard, Settings, ShoppingCart, Users, Wrench } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
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
  const { state, setOpen } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-sidebar/95 via-sidebar/85 to-sidebar/90 backdrop-blur-xl -z-10" />
      <SidebarHeader className="p-4 border-b border-sidebar-border/50">
        <div className="flex items-center gap-3">
          <img src={ratariaLogo} alt="Ratar.ia" className="w-8 h-8 rounded-lg shrink-0" />
          {!collapsed && (
            <span className="text-sm font-semibold text-foreground tracking-tight whitespace-nowrap">
              Ratar.ia
            </span>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
