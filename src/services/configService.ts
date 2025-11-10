import { supabase } from '@/integrations/supabase/client';

export interface ConfigData {
  nombre_gestoria: string;
  rfc?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  logo_url?: string;
  notif_crear_expediente?: boolean;
  notif_cambio_estado?: boolean;
  notif_recordatorio_pago?: boolean;
  dias_recordatorio?: number;
  moneda?: 'MXN' | 'USD' | 'EUR';
  permitir_pagos_parciales?: boolean;
  generar_recibos_auto?: boolean;
}

export const configService = {
  async get() {
    const { data, error } = await supabase
      .from('gestoria_config')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    
    // If no config exists, create default one
    if (!data) {
      return this.createDefault();
    }

    return data;
  },

  async createDefault() {
    const defaultConfig: ConfigData = {
      nombre_gestoria: 'Asesoría Gex',
      rfc: '',
      telefono: '',
      email: '',
      direccion: '',
      logo_url: null,
      notif_crear_expediente: true,
      notif_cambio_estado: true,
      notif_recordatorio_pago: true,
      dias_recordatorio: 7,
      moneda: 'EUR',
      permitir_pagos_parciales: true,
      generar_recibos_auto: false
    };

    const { data, error } = await supabase
      .from('gestoria_config')
      .insert([defaultConfig])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(configData: Partial<ConfigData>) {
    // Get existing config
    const existing = await this.get();

    if (!existing.id) {
      throw new Error('Config not found');
    }

    const { data, error } = await supabase
      .from('gestoria_config')
      .update(configData)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async uploadLogo(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async deleteLogo(logoUrl: string) {
    // Extract file path from URL
    const urlParts = logoUrl.split('/documents/');
    if (urlParts.length < 2) return;

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from('documents')
      .remove([filePath]);

    if (error) throw error;
  }
};
