export interface DashboardMetrics {
  totalClientes: number;
  nuevosClientesMes: number;
  expedientesActivos: number;
  expedientesPendientes: number;
  pendienteCobro: number;
  expedientesConSaldo: number;
}

export interface ExpedientePorEstado {
  estado: string;
  cantidad: number;
  fill: string;
}

export interface IngresoMensual {
  mes: string;
  ingresos: number;
}

export interface ExpedienteReciente {
  id: string;
  numero: string;
  cliente: string;
  tramite: string;
  estado: string;
  fecha: string;
}

export interface PagoPendiente {
  id: string;
  cliente: string;
  expediente: string;
  monto: number;
  fechaVencimiento: string;
  vencido: boolean;
}

export interface TipoTramiteStats {
  nombre: string;
  cantidad: number;
}

export interface DashboardData {
  metricas: DashboardMetrics;
  expedientesPorEstado: ExpedientePorEstado[];
  ingresosMensuales: IngresoMensual[];
  expedientesRecientes: ExpedienteReciente[];
  pagosPendientes: PagoPendiente[];
  tiposTramite: TipoTramiteStats[];
}
