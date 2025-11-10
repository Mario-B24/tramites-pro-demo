import { supabase } from '@/integrations/supabase/client';

export interface DocumentoRequeridoData {
  tipo_tramite_id: string;
  nombre_documento: string;
  descripcion: string;
  orden: number;
  obligatorio: boolean;
}

export const documentosService = {
  async getAll() {
    const { data, error } = await supabase
      .from('documentos_requeridos')
      .select(`
        *,
        tipo_tramite:tipos_tramite(nombre)
      `)
      .order('tipo_tramite_id', { ascending: true })
      .order('orden', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getByTipoTramite(tipoTramiteId: string) {
    const { data, error } = await supabase
      .from('documentos_requeridos')
      .select('*')
      .eq('tipo_tramite_id', tipoTramiteId)
      .order('orden', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async create(docData: DocumentoRequeridoData) {
    const { data, error } = await supabase
      .from('documentos_requeridos')
      .insert([docData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, docData: Partial<DocumentoRequeridoData>) {
    const { data, error } = await supabase
      .from('documentos_requeridos')
      .update(docData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('documentos_requeridos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async createBulk(tipoTramiteId: string, documentos: (Omit<DocumentoRequeridoData, 'tipo_tramite_id'> & { active?: boolean })[]) {
    console.log('=== createBulk ===');
    console.log('tipoTramiteId:', tipoTramiteId);
    console.log('documentos recibidos:', documentos);

    // Validación
    if (!tipoTramiteId) {
      throw new Error('tipo_tramite_id es requerido');
    }

    if (!documentos || documentos.length === 0) {
      console.log('No hay documentos para crear');
      return [];
    }

    const docsWithTipo = documentos.map((doc, index) => {
      if (!doc.nombre_documento || doc.nombre_documento.trim() === '') {
        throw new Error(`Documento ${index + 1}: nombre_documento es requerido`);
      }

      return {
        tipo_tramite_id: tipoTramiteId,
        nombre_documento: doc.nombre_documento.trim(),
        descripcion: doc.descripcion || '',
        orden: doc.orden || (index + 1),
        obligatorio: doc.obligatorio ?? true,
        active: doc.active ?? true
      };
    });

    console.log('Documentos preparados para insertar:', docsWithTipo);

    const { data, error } = await supabase
      .from('documentos_requeridos')
      .insert(docsWithTipo)
      .select();
    
    if (error) {
      console.error('Error de Supabase:', error);
      throw error;
    }

    console.log('Documentos insertados correctamente:', data);
    return data;
  }
};
