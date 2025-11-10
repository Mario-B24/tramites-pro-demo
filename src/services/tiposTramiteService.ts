import { supabase } from '@/integrations/supabase/client';

export interface TipoTramiteData {
  nombre: string;
  codigo: string;
  precio_base?: number;
  active?: boolean;
}

export interface DocumentoRequeridoData {
  tipo_tramite_id: string;
  nombre_documento: string;
  descripcion: string;
  orden: number;
  obligatorio: boolean;
}

export const tiposTramiteService = {
  async getAll() {
    const { data, error } = await supabase
      .from('tipos_tramite')
      .select(`
        *,
        documentos_requeridos:documentos_requeridos(count)
      `)
      .order('nombre', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('tipos_tramite')
      .select(`
        *,
        documentos_requeridos(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(tipoData: TipoTramiteData) {
    const { data, error } = await supabase
      .from('tipos_tramite')
      .insert([tipoData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, tipoData: Partial<TipoTramiteData>) {
    const { data, error } = await supabase
      .from('tipos_tramite')
      .update(tipoData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    // Check if has expedientes
    const { data: expedientes } = await supabase
      .from('expedientes')
      .select('id')
      .eq('tipo_tramite_id', id)
      .limit(1);

    if (expedientes && expedientes.length > 0) {
      throw new Error('No se puede eliminar. Este tipo de trámite tiene expedientes asociados.');
    }

    const { error } = await supabase
      .from('tipos_tramite')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async toggleActive(id: string, active: boolean) {
    const { data, error } = await supabase
      .from('tipos_tramite')
      .update({ active })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
