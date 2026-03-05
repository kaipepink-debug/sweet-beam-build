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
  { title: "Visão Geral", url: "/dashboard", icon: Eye },
  { title: "Financeiro", url: "/dashboard/financeiro", icon: CreditCard },
  { title: "Vendas", url: "/dashboard/vendas", icon: ShoppingCart },
  { title: "Assinaturas", url: "/dashboard/assinaturas", icon: LayoutDashboard },
  { title: "Clientes", url: "/dashboard/clientes", icon: Users },
  { title: "Ferramentas", url: "/dashboard/ferramentas", icon: Wrench },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Configurações", url: "/dashboard/configuracoes", icon: Settings },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <img src={ratariaLogo} alt="Ratar.ia" className="w-8 h-8 rounded-lg" />
          {!collapsed && (
            <span className="text-sm font-semibold text-foreground tracking-tight">
              Ratar.ia Admin
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
                      <item.icon className="h-4 w-4" />
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
