import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';

export function useDashboardMetricas() {
  // Read date filters from localStorage
  const getDateFilters = () => {
    try {
      const filters = localStorage.getItem('paymentDateFilters');
      if (filters) {
        const parsed = JSON.parse(filters);
        return {
          fechaInicio: parsed.fechaInicio,
          fechaFin: parsed.fechaFin
        };
      }
    } catch (e) {
      console.error('Error reading date filters:', e);
    }
    return { fechaInicio: undefined, fechaFin: undefined };
  };

  const { fechaInicio, fechaFin } = getDateFilters();

  return useQuery({
    queryKey: ['dashboard', 'metricas', fechaInicio, fechaFin],
    queryFn: () => dashboardService.getMetricas(fechaInicio, fechaFin),
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });
}

export function useExpedientesPorEstado() {
  return useQuery({
    queryKey: ['dashboard', 'expedientes-estado'],
    queryFn: dashboardService.getExpedientesPorEstado
  });
}

export function useIngresosMensuales() {
  return useQuery({
    queryKey: ['dashboard', 'ingresos-mensuales'],
    queryFn: dashboardService.getIngresosMensuales
  });
}

export function useExpedientesRecientes(limit: number = 5) {
  return useQuery({
    queryKey: ['dashboard', 'expedientes-recientes', limit],
    queryFn: () => dashboardService.getExpedientesRecientes(limit)
  });
}

export function usePagosPendientes(limit: number = 5) {
  return useQuery({
    queryKey: ['dashboard', 'pagos-pendientes', limit],
    queryFn: () => dashboardService.getPagosPendientes(limit)
  });
}

export function useTiposTramite() {
  return useQuery({
    queryKey: ['dashboard', 'tipos-tramite'],
    queryFn: dashboardService.getTiposTramite
  });
}
