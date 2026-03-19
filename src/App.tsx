import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import UnderDevelopment from "@/components/dashboard/UnderDevelopment";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardFerramentas from "./pages/DashboardFerramentas";
import DashboardEquipe from "./pages/DashboardEquipe";
import GrokGerenciamento from "./pages/GrokGerenciamento";
import FerramentaGerenciamento from "./pages/FerramentaGerenciamento";
import DashboardGmail from "./pages/DashboardGmail";
import NotFound from "./pages/NotFound";
import Cod from "./pages/Cod";
import Usuario from "./pages/Usuario";
import Painel from "./pages/Painel";
import Ferramentas from "./pages/Ferramentas";
import Cursos from "./pages/Cursos";
import CursoPlayer from "./pages/CursoPlayer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<div className="desktop-zoom"><Login /></div>} />

            {/* Dashboard routes with shared layout */}
            <Route element={<ProtectedRoute><div className="desktop-zoom"><DashboardLayout /></div></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard-ferramentas" element={<DashboardFerramentas />} />
              <Route path="/dashboard-ferramentas/:toolId" element={<FerramentaGerenciamento />} />
              <Route path="/dashboard-equipe" element={<DashboardEquipe />} />
              <Route path="/dashboard/gmail" element={<DashboardGmail />} />
              <Route path="/dashboard/financeiro" element={<UnderDevelopment />} />
              <Route path="/dashboard/vendas" element={<UnderDevelopment />} />
              <Route path="/dashboard/assinaturas" element={<UnderDevelopment />} />
              <Route path="/dashboard/clientes" element={<UnderDevelopment />} />
              <Route path="/dashboard/analytics" element={<UnderDevelopment />} />
              <Route path="/dashboard/configuracoes" element={<UnderDevelopment />} />
            </Route>

            <Route path="/cod" element={<Cod />} />
            <Route path="/usuario" element={<Usuario />} />
            <Route path="/painel" element={<Painel />} />
            <Route path="/ferramentas" element={<Ferramentas />} />
            <Route path="/cursos" element={<Cursos />} />
            <Route path="/cursos/:courseId" element={<CursoPlayer />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
