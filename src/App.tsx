import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardFerramentas from "./pages/DashboardFerramentas";
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
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/dashboard-ferramentas"
              element={
                <ProtectedRoute>
                  <DashboardFerramentas />
                </ProtectedRoute>
              }
            />
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
