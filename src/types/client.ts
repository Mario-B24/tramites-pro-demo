export interface Client {
  id: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  nacionalidad?: string;
  nie?: string;
  pasaporte?: string;
  fecha_vencimiento_nie?: string;
  fecha_nacimiento?: string;
  tipo_via?: string;
  calle?: string;
  numero?: string;
  piso?: string;
  puerta?: string;
  observaciones?: string;
  empresa?: string;
  created_at?: string;
  updated_at?: string;
}
