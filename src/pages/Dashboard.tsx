import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RevenuePlanChart } from "@/components/dashboard/RevenuePlanChart";
import { RetentionSection } from "@/components/dashboard/RetentionSection";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  CreditCard,
  Users,
  UserMinus,
} from "lucide-react";

const metrics = [
  { title: "Faturamento Total", value: "R$ 52.400", change: 12.5, icon: DollarSign },
  { title: "Receita Recorrente", value: "R$ 38.100", change: 8.2, icon: TrendingUp },
  { title: "Total de Vendas", value: "1.284", change: 15.3, icon: ShoppingCart },
  { title: "Assinaturas Ativas", value: "847", change: 4.1, icon: CreditCard },
  { title: "Total de Clientes", value: "1.520", change: 6.8, icon: Users },
  { title: "Cancelamentos", value: "23", change: -12.0, icon: UserMinus },
];

export default function Dashboard() {
  const [period, setPeriod] = useState("30 dias");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardTopbar activePeriod={period} onPeriodChange={setPeriod} />
          <main className="flex-1 p-4 md:p-6 space-y-6 overflow-auto">
            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {metrics.map((m) => (
                <MetricCard key={m.title} {...m} />
              ))}
            </div>

            {/* Revenue Chart */}
            <RevenueChart />

            {/* Revenue by Plan + Retention */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenuePlanChart />
              <RetentionSection />
            </div>

            {/* Recent Activity */}
            <RecentActivity />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
