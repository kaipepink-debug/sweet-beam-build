import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import ToolsSection from "@/components/sales/ToolsSection";

export default function DashboardFerramentas() {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0 ml-[60px]">
        <DashboardTopbar />
        <main className="flex-1 overflow-auto">
          <ToolsSection />
        </main>
      </div>
    </div>
  );
}
