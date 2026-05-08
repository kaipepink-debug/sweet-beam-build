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
import BannersAviso from "./pages/BannersAviso";
import DashboardGmail from "./pages/DashboardGmail";
import NotFound from "./pages/NotFound";
import Cod from "./pages/Cod";
import Usuario from "./pages/Usuario";
import Painel from "./pages/Painel";
import Ferramentas from "./pages/Ferramentas";
import Cursos from "./pages/Cursos";
import CursoPlayer from "./pages/CursoPlayer";
import DashboardAssinaturas from "./pages/DashboardAssinaturas";
import DashboardAcessoClientes from "./pages/DashboardAcessoClientes";
import DashboardPixels from "./pages/DashboardPixels";
import DashboardVturb from "./pages/DashboardVturb";
import DashboardFinanceiro from "./pages/DashboardFinanceiro";
import DashboardAfiliados from "./pages/DashboardAfiliados";
import DashboardLogins from "./pages/DashboardLogins";
import DashboardAreaMembros from "./pages/DashboardAreaMembros";
import SalesPageEN from "./pages/SalesPageEN";
import PainelTemp from "./pages/PainelTemp";
import FerramentasTemp from "./pages/FerramentasTemp";
import DashboardVerificacaoLogin from "./pages/DashboardVerificacaoLogin";
import DashboardInadimplencia from "./pages/DashboardInadimplencia";
import DashboardMateriais from "./pages/DashboardMateriais";
import CadastroAfiliado from "./pages/CadastroAfiliado";

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
            <Route path="/en" element={<SalesPageEN />} />
            <Route path="/login" element={<div className="desktop-zoom"><Login /></div>} />
            <Route path="/cadastro-afiliado" element={<CadastroAfiliado />} />

            {/* Dashboard routes with shared layout */}
            <Route element={<ProtectedRoute><div className="desktop-zoom"><DashboardLayout /></div></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard-ferramentas" element={<DashboardFerramentas />} />
              <Route path="/dashboard/gerar-avisos" element={<BannersAviso />} />
              <Route path="/dashboard-ferramentas/:toolId" element={<FerramentaGerenciamento />} />
              <Route path="/dashboard-equipe" element={<DashboardEquipe />} />
              <Route path="/dashboard/gmail" element={<DashboardGmail />} />
              <Route path="/dashboard/financeiro" element={<DashboardFinanceiro />} />
              <Route path="/dashboard/vendas" element={<UnderDevelopment />} />
              <Route path="/dashboard/assinaturas" element={<DashboardAssinaturas />} />
              <Route path="/dashboard/verificacao-login" element={<DashboardVerificacaoLogin />} />
              <Route path="/dashboard/inadimplencia" element={<DashboardInadimplencia />} />
              <Route path="/dashboard/clientes" element={<UnderDevelopment />} />
              <Route path="/dashboard/analytics" element={<UnderDevelopment />} />
              <Route path="/dashboard/acesso-clientes" element={<DashboardAcessoClientes />} />
              <Route path="/dashboard/pixels" element={<DashboardPixels />} />
              <Route path="/dashboard/vturb" element={<DashboardVturb />} />
              <Route path="/dashboard/configuracoes" element={<UnderDevelopment />} />
              <Route path="/dashboard/afiliados" element={<DashboardAfiliados />} />
              <Route path="/dashboard/logins" element={<DashboardLogins />} />
              <Route path="/dashboard/area-membros" element={<DashboardAreaMembros />} />
              <Route path="/dashboard/materiais" element={<DashboardMateriais />} />
            </Route>

            <Route path="/cod" element={<Cod />} />
            <Route path="/usuario" element={<Usuario />} />
            <Route path="/painel" element={<Painel />} />
            <Route path="/painel-temp" element={<PainelTemp />} />
            <Route path="/ferramentas" element={<Ferramentas />} />
            <Route path="/ferramentas-temp" element={<FerramentasTemp />} />
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
