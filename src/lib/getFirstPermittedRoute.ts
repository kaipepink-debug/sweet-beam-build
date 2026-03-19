const routeOrder = [
  { permKey: "dashboard", url: "/dashboard" },
  { permKey: "financeiro", url: "/dashboard/financeiro" },
  { permKey: "vendas", url: "/dashboard/vendas" },
  { permKey: "assinaturas", url: "/dashboard/assinaturas" },
  { permKey: "clientes", url: "/dashboard/clientes" },
  { permKey: "email_acesso", url: "/dashboard/gmail" },
  { permKey: "ferramentas_ia", url: "/dashboard-ferramentas" },
  { permKey: "analytics", url: "/dashboard/analytics" },
  { permKey: "equipe", url: "/dashboard-equipe" },
  { permKey: "configuracoes", url: "/dashboard/configuracoes" },
] as const;

export function getFirstPermittedRoute(perms: Record<string, any> | null): string {
  if (!perms) return "/dashboard";
  
  for (const item of routeOrder) {
    if (perms[item.permKey]) return item.url;
  }
  
  return "/dashboard";
}
