export type PaymentStatus = 'pendiente' | 'parcial' | 'completado' | 'vencido';
export type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque';

export interface Payment {
  id: string;
  expediente_id: string;
  expediente_nombre: string;
  cliente_nombre: string;
  monto: number;
  metodo_pago: PaymentMethod;
  estado: PaymentStatus;
  fecha_pago: string;
  notas?: string;
}
