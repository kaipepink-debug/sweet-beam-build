import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout() {
  useEffect(() => {
    const saved = localStorage.getItem("dashboard-theme");
    if (saved === "dark") {
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      if (!saved) localStorage.setItem("dashboard-theme", "light");
    }
  }, []);
  return (
    <div className="min-h-screen flex w-full bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0 ml-[220px]">
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
