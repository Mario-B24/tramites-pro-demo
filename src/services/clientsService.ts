import { supabase } from '@/integrations/supabase/client';

export interface ClientData {
  nombre: string;
  apellidos: string;
  empresa?: string;
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
}

export const clientsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(clientData: ClientData) {
    const { data, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, clientData: Partial<ClientData>) {
    const { data, error } = await supabase
      .from('clients')
      .update(clientData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    // Eliminación manual de dependencias para evitar errores de FK bajo RLS
    const deletePayments = await supabase
      .from('payments')
      .delete()
      .eq('cliente_id', id);
    if (deletePayments.error) throw deletePayments.error;

    const deleteExpedientes = await supabase
      .from('expedientes')
      .delete()
      .eq('cliente_id', id);
    if (deleteExpedientes.error) throw deleteExpedientes.error;

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async getExpedientes(clienteId: string) {
    const { data, error } = await supabase
      .from('expedientes')
      .select(`
        *,
        tipo_tramite:tipos_tramite(nombre)
      `)
      .eq('cliente_id', clienteId)
      .order('fecha_inicio', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getPayments(clienteId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        expediente:expedientes(numero_expediente, tipo_tramite:tipos_tramite(nombre))
      `)
      .eq('cliente_id', clienteId)
      .order('fecha_pago', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};
