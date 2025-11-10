import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, FileText, Users, FolderOpen } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold">
            Asesoría Gex
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Sistema de Gestión - Administra clientes, expedientes, trámites y pagos en un solo lugar
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Comenzar
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
              Iniciar Sesión
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 rounded-lg border bg-card">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Gestión de Clientes</h3>
              <p className="text-sm text-muted-foreground">
                Administra la información completa de tus clientes
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <FolderOpen className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Control de Expedientes</h3>
              <p className="text-sm text-muted-foreground">
                Organiza y da seguimiento a todos los expedientes
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Trámites y Documentos</h3>
              <p className="text-sm text-muted-foreground">
                Gestiona tipos de trámites y documentos requeridos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
