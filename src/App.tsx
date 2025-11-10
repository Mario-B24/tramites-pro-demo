import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import ClienteDetalle from "./pages/ClienteDetalle";
import Expedientes from "./pages/Expedientes";
import ExpedienteDetalle from "./pages/ExpedienteDetalle";
import TiposTramite from "./pages/TiposTramite";
import DocumentosRequeridos from "./pages/DocumentosRequeridos";
import Payments from "./pages/Payments";
import Configuracion from "./pages/Configuracion";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Layout for protected routes with sidebar
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <main className="flex-1">
        <header className="h-14 border-b flex items-center px-4">
          <SidebarTrigger />
        </header>
        <div className="flex-1">{children}</div>
      </main>
    </div>
  </SidebarProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected routes with sidebar */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/clientes" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Clientes />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/clientes/:id" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <ClienteDetalle />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/expedientes" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Expedientes />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/expedientes/:id" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <ExpedienteDetalle />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/tipos-tramite" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <TiposTramite />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/documentos-requeridos" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <DocumentosRequeridos />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/pagos" element={
              <ProtectedRoute>
                <AdminRoute>
                  <ProtectedLayout>
                    <Payments />
                  </ProtectedLayout>
                </AdminRoute>
              </ProtectedRoute>
            } />
            <Route path="/configuracion" element={
              <ProtectedRoute>
                <AdminRoute>
                  <ProtectedLayout>
                    <Configuracion />
                  </ProtectedLayout>
                </AdminRoute>
              </ProtectedRoute>
            } />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
