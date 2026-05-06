import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ToolAlerts } from "@/components/dashboard/ToolAlerts";
import { usePermissions } from "@/hooks/usePermissions";
import { getFirstPermittedRoute } from "@/lib/getFirstPermittedRoute";
import ComprarLimiteDialog from "@/components/dashboard/ComprarLimiteDialog";
import { useComprarLimite } from "@/hooks/useComprarLimite";

const routePermMap: Record<string, string> = {
  "/dashboard": "dashboard",
  "/dashboard/financeiro": "financeiro",
  "/dashboard/vendas": "vendas",
  "/dashboard/assinaturas": "assinaturas",
  "/dashboard/clientes": "clientes",
  "/dashboard/gmail": "email_acesso",
  "/dashboard-ferramentas": "ferramentas_ia",
  "/dashboard/gerar-avisos": "ferramentas_ia",
  "/dashboard/analytics": "analytics",
  "/dashboard-equipe": "equipe",
  "/dashboard/afiliados": "afiliados",
  "/dashboard/configuracoes": "configuracoes",
};

export default function DashboardLayout() {
  const { permissions, loading } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();
  const { open: comprarOpen, setOpen: setComprarOpen } = useComprarLimite();

  useEffect(() => {
    const saved = localStorage.getItem("dashboard-theme");
    if (saved === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
      if (!saved) localStorage.setItem("dashboard-theme", "dark");
    }
  }, []);

  useEffect(() => {
    if (loading) return;

    const path = location.pathname;
    // Check if current route requires a permission the user doesn't have
    const permKey = Object.entries(routePermMap).find(([route]) => {
      if (route === "/dashboard-ferramentas") return path.startsWith("/dashboard-ferramentas");
      return path === route;
    })?.[1];

    if (permKey && !permissions[permKey as keyof typeof permissions]) {
      navigate(getFirstPermittedRoute(permissions as any), { replace: true });
    }
  }, [loading, permissions, location.pathname, navigate]);

  return (
    <div className="dashboard-area min-h-screen flex w-full bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0 ml-[220px]">
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {!loading && !permissions.is_afiliado && <ToolAlerts />}
          <Outlet />
        </main>
      </div>
      {!loading && permissions.is_afiliado && (
        <ComprarLimiteDialog open={comprarOpen} onOpenChange={setComprarOpen} />
      )}
    </div>
  );
}
