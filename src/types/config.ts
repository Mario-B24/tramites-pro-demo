export interface GestoriaConfig {
  id: string;
  nombre_gestoria: string;
  rfc: string;
  telefono: string;
  email: string;
  direccion: string;
  logo_url: string | null;
  notif_crear_expediente: boolean;
  notif_cambio_estado: boolean;
  notif_recordatorio_pago: boolean;
  dias_recordatorio: number;
  moneda: 'MXN' | 'USD' | 'EUR';
  permitir_pagos_parciales: boolean;
  generar_recibos_auto: boolean;
  updated_at: string;
}
