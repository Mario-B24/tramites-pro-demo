import { Users, FolderOpen } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ExpedientesChart } from '@/components/dashboard/ExpedientesChart';
import { IngresosChart } from '@/components/dashboard/IngresosChart';
import { RecentExpedientes } from '@/components/dashboard/RecentExpedientes';
import { TiposTramiteChart } from '@/components/dashboard/TiposTramiteChart';
import { useDashboardMetricas, useExpedientesPorEstado, useIngresosMensuales, useExpedientesRecientes, useTiposTramite } from '@/hooks/useDashboard';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
const Dashboard = () => {
  const {
    data: session
  } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const {
        data
      } = await supabase.auth.getSession();
      return data.session;
    }
  });
  const {
    data: role
  } = useUserRole(session?.user?.id);
  const isAdmin = role === 'admin';
  const {
    data: metricas,
    isLoading: loadingMetricas
  } = useDashboardMetricas();
  const {
    data: expedientesPorEstado = [],
    isLoading: loadingEstados
  } = useExpedientesPorEstado();
  const {
    data: ingresosMensuales = [],
    isLoading: loadingIngresos
  } = useIngresosMensuales();
  const {
    data: expedientesRecientes = [],
    isLoading: loadingRecientes
  } = useExpedientesRecientes();
  const {
    data: tiposTramite = [],
    isLoading: loadingTiposTramite
  } = useTiposTramite();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };
  if (loadingMetricas || !metricas) {
    return <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Pantalla Principal </h1>
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>
      </div>;
  }
  return <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Pantalla Principal</h1>
        <p className="text-muted-foreground">Resumen general de Asesoría Gex</p>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard title="Total Clientes" value={metricas.totalClientes} subtitle={`+${metricas.nuevosClientesMes} nuevos este mes`} icon={Users} iconColor="text-chart-1" iconBgColor="bg-chart-1/10" />
        <MetricCard title="Expedientes Activos" value={metricas.expedientesActivos} subtitle={`${metricas.expedientesPendientes} pendientes de atención`} icon={FolderOpen} iconColor="text-chart-2" iconBgColor="bg-chart-2/10" />
      </div>

      {/* Gráficos */}
      <div className={`grid gap-4 ${isAdmin ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
        <ExpedientesChart data={expedientesPorEstado} />
        {isAdmin && <IngresosChart data={ingresosMensuales} />}
      </div>

      {/* Gráfico de Tipos de Trámite */}
      <TiposTramiteChart data={tiposTramite} />

      {/* Tabla de Expedientes Pendientes */}
      <RecentExpedientes data={expedientesRecientes} />
    </div>;
};
export default Dashboard;