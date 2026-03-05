import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { SessionByCountry } from "@/components/dashboard/SessionByCountry";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Users,
} from "lucide-react";

const metrics = [
  { title: "Faturamento Total", value: "R$ 348.261", change: 10.05, icon: DollarSign, accentColor: "#22c55e" },
  { title: "Lucro", value: "R$ 15.708,98", change: 8.15, icon: TrendingUp, accentColor: "#a855f7" },
  { title: "Total de Receita", value: "7.415.644", change: 3.98, icon: ShoppingCart, accentColor: "#3b82f6" },
  { title: "Total de Conversão", value: "10,87%", change: -31.45, icon: Users, accentColor: "#f97316" },
];

export default function Dashboard() {
  const [period, setPeriod] = useState("30 dias");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardTopbar activePeriod={period} onPeriodChange={setPeriod} />
          <main className="flex-1 p-4 md:p-6 space-y-5 overflow-auto">
            {/* Metric Cards - 4 in a row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.map((m) => (
                <MetricCard key={m.title} {...m} />
              ))}
            </div>

            {/* Chart + Session by Country */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <RevenueChart />
              </div>
              <SessionByCountry />
            </div>

            {/* Transaction History */}
            <RecentActivity />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
