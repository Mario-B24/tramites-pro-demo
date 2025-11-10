export type EstadoExpediente = 
  | 'pendiente_documentos'
  | 'pendiente_firmar'
  | 'pendiente_tasas'
  | 'pendiente_presentar'
  | 'presentado'
  | 'en_tramite'
  | 'requerido'
  | 'contestacion_requerimiento'
  | 'resuelto_favorable'
  | 'resuelto_desfavorable'
  | 'archivado';

export type EstadoDocumento = 'pendiente' | 'recibido' | 'validado';

export interface Expediente {
  id: string;
  numero_expediente: string;
  cliente: {
    id: string;
    nombre: string;
    apellidos: string;
    nie: string;
  };
  tipo_tramite: {
    id: string;
    nombre: string;
    codigo: string;
  };
  estado: EstadoExpediente;
  precio_acordado: number;
  fecha_inicio: string;
  fecha_presentacion?: string;
  numero_expediente_oficial?: string;
  observaciones?: string;
}

export interface Documento {
  id: string;
  expediente_id: string;
  nombre: string;
  estado: EstadoDocumento;
  fecha_recibido?: string;
  archivo_url?: string;
}

export interface HistorialEstado {
  id: string;
  expediente_id: string;
  estado_anterior: EstadoExpediente | null;
  estado_nuevo: EstadoExpediente;
  fecha: string;
  usuario: string;
  observaciones?: string;
}

export interface Pago {
  id: string;
  expediente_id: string;
  fecha: string;
  importe: number;
  metodo: string;
  concepto: string;
}

// Estados con sus configuraciones de visualización
export const estadosConfig: Record<EstadoExpediente, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pendiente_documentos: { label: 'Pendiente Docs', variant: 'outline' },
  pendiente_firmar: { label: 'Pendiente Firmar', variant: 'outline' },
  pendiente_tasas: { label: 'Pendiente Tasas', variant: 'outline' },
  pendiente_presentar: { label: 'Pendiente Presentar', variant: 'outline' },
  presentado: { label: 'Presentado', variant: 'secondary' },
  en_tramite: { label: 'En Trámite', variant: 'secondary' },
  requerido: { label: 'Requerido', variant: 'destructive' },
  contestacion_requerimiento: { label: 'Contestación Requerimiento', variant: 'secondary' },
  resuelto_favorable: { label: 'Resuelto ✓', variant: 'default' },
  resuelto_desfavorable: { label: 'Resuelto ✗', variant: 'destructive' },
  archivado: { label: 'Archivado', variant: 'outline' }
};
