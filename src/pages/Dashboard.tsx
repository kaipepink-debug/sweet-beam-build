import { SidebarProvider } from "@/components/ui/sidebar";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { MonthlyGoalProgress } from "@/components/dashboard/MonthlyGoalProgress";
import { TopPlanCard } from "@/components/dashboard/TopPlanCard";
import { RecentClients } from "@/components/dashboard/RecentClients";
import { SubscriptionGrowth } from "@/components/dashboard/SubscriptionGrowth";
import { QuickMetrics } from "@/components/dashboard/QuickMetrics";
import { ToolAlerts } from "@/components/dashboard/ToolAlerts";
import { Zap } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-5">
      {/* Tool Alerts */}
      <ToolAlerts />
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Acompanhe o desempenho da sua plataforma de IA</p>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Bem-vindo de volta, Admin!
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-foreground font-semibold">0</span>
            <span>ferramentas ativas</span>
          </div>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
            <span>+ Novo Relatório</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics */}
      <QuickMetrics />

      {/* Main Grid: Chart + Goal Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <MonthlyGoalProgress />
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <TopPlanCard />
        <RecentClients />
        <SubscriptionGrowth />
      </div>
    </div>
  );
}
