export interface TipoTramite {
  id: string;
  nombre: string;
  codigo: string;
  precio_base: number;
  active: boolean;
  num_documentos?: number;
}

export interface DocumentoRequerido {
  id: string;
  tipo_tramite_id: string;
  tipo_nombre?: string;
  nombre_documento: string;
  descripcion: string;
  orden: number;
  active: boolean;
}

export interface DocumentoFormItem {
  id?: string; // For existing documents
  nombre_documento: string;
  descripcion: string;
  orden: number;
  active: boolean;
  obligatorio: boolean;
  temp_id?: string; // For tracking items in the form
}
