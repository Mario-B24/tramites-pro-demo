import { supabase } from '@/integrations/supabase/client';

export interface ExpedienteData {
  cliente_id: string;
  tipo_tramite_id: string;
  numero_expediente: string;
  estado: string;
  precio_acordado: number;
  fecha_inicio: string;
  fecha_presentacion?: string;
  numero_expediente_oficial?: string;
  observaciones?: string;
}

export interface CambiarEstadoData {
  estado_nuevo: string;
  fecha_cambio: string;
  observaciones?: string;
}

export const expedientesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('expedientes')
      .select(`
        *,
        cliente:clients(id, nombre, empresa, telefono),
        tipo_tramite:tipos_tramite(id, nombre, codigo)
      `)
      .order('fecha_inicio', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('expedientes')
      .select(`
        *,
        cliente:clients(*),
        tipo_tramite:tipos_tramite(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(expedienteData: ExpedienteData) {
    // Verificar si el número de expediente ya existe
    const { data: existing } = await supabase
      .from('expedientes')
      .select('numero_expediente')
      .eq('numero_expediente', expedienteData.numero_expediente)
      .single();
    
    if (existing) {
      throw new Error('El número de expediente ya existe');
    }

    const { data, error } = await supabase
      .from('expedientes')
      .insert([expedienteData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, expedienteData: Partial<ExpedienteData>) {
    const { data, error } = await supabase
      .from('expedientes')
      .update(expedienteData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('expedientes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async cambiarEstado(expedienteId: string, cambioData: CambiarEstadoData) {
    // Get current state
    const { data: expediente } = await supabase
      .from('expedientes')
      .select('estado')
      .eq('id', expedienteId)
      .single();

    // Prepare update data
    const updateData: any = { estado: cambioData.estado_nuevo };
    
    // Si el nuevo estado es "presentado", actualizar fecha_presentacion_real con fecha_cambio
    if (cambioData.estado_nuevo === 'presentado') {
      updateData.fecha_presentacion_real = cambioData.fecha_cambio;
    }

    // Update estado and optionally fecha_presentacion_real
    const { data: updated, error: updateError } = await supabase
      .from('expedientes')
      .update(updateData)
      .eq('id', expedienteId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Insert historial with manual fecha_cambio
    const { error: historialError } = await supabase
      .from('historial_estados')
      .insert([{
        expediente_id: expedienteId,
        estado_anterior: expediente?.estado,
        estado_nuevo: cambioData.estado_nuevo,
        fecha_cambio: cambioData.fecha_cambio,
        usuario_id: (await supabase.auth.getUser()).data.user?.id,
        observaciones: cambioData.observaciones
      }]);

    if (historialError) throw historialError;

    return updated;
  },

  async getDocumentos(expedienteId: string) {
    const { data, error } = await supabase
      .from('expediente_documentos')
      .select(`
        *,
        documento_requerido:documentos_requeridos(nombre_documento, descripcion, obligatorio)
      `)
      .eq('expediente_id', expedienteId)
      .order('documento_requerido.orden', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async marcarDocumentoRecibido(documentoId: string, recibido: boolean) {
    const { data, error } = await supabase
      .from('expediente_documentos')
      .update({
        estado_documento: recibido ? 'recibido' : 'pendiente',
        fecha_recibido: recibido ? new Date().toISOString() : null
      })
      .eq('id', documentoId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getHistorialEstados(expedienteId: string) {
    const { data, error } = await supabase
      .from('historial_estados')
      .select('*')
      .eq('expediente_id', expedienteId)
      .order('fecha_cambio', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async deleteHistorialEstado(historialId: string, expedienteId: string) {
    console.log('Deleting historial estado:', historialId);
    
    // Obtener el historial antes de eliminarlo para saber si es el más reciente
    const { data: historialData, error: fetchError } = await supabase
      .from('historial_estados')
      .select('*')
      .eq('id', historialId)
      .single();

    if (fetchError) {
      console.error('Error fetching historial estado:', fetchError);
      throw fetchError;
    }

    // Verificar si es el cambio más reciente
    const { data: historialList, error: listError } = await supabase
      .from('historial_estados')
      .select('id, estado_anterior, estado_nuevo, fecha_cambio')
      .eq('expediente_id', expedienteId)
      .order('fecha_cambio', { ascending: false });

    if (listError) {
      console.error('Error fetching historial list:', listError);
      throw listError;
    }

    const esMasReciente = historialList && historialList[0]?.id === historialId;

    // Eliminar el registro del historial
    const { error: deleteError } = await supabase
      .from('historial_estados')
      .delete()
      .eq('id', historialId);

    if (deleteError) {
      console.error('Error deleting historial estado:', deleteError);
      throw deleteError;
    }

    // Si era el más reciente, revertir el estado del expediente al estado anterior
    if (esMasReciente && historialData.estado_anterior) {
      const { error: updateError } = await supabase
        .from('expedientes')
        .update({ estado: historialData.estado_anterior })
        .eq('id', expedienteId);

      if (updateError) {
        console.error('Error reverting expediente estado:', updateError);
        throw updateError;
      }
    }

    return { success: true };
  }
};
