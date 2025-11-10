import { supabase } from '@/integrations/supabase/client';

export interface PaymentData {
  cliente_id: string;
  expediente_id: string;
  importe: number;
  metodo_pago: string;
  fecha_pago: string;
  concepto?: string;
  observaciones?: string;
}

export const paymentsService = {
  async getAll(fechaInicio?: string, fechaFin?: string) {
    let query = supabase
      .from('payments')
      .select(`
        *,
        expediente:expedientes(
          numero_expediente,
          cliente:clients(nombre, apellidos, empresa)
        )
      `);

    if (fechaInicio) {
      query = query.gte('fecha_pago', fechaInicio);
    }
    if (fechaFin) {
      query = query.lte('fecha_pago', fechaFin);
    }

    const { data, error } = await query.order('fecha_pago', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getByExpediente(expedienteId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('expediente_id', expedienteId)
      .order('fecha_pago', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(paymentData: PaymentData) {
    const { data, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, paymentData: Partial<PaymentData>) {
    const { data, error } = await supabase
      .from('payments')
      .update(paymentData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getStats(fechaInicio?: string, fechaFin?: string) {
    // Get filtered payments - Total Recibido
    let allPaymentsQuery = supabase.from('payments').select('importe');
    
    if (fechaInicio) {
      allPaymentsQuery = allPaymentsQuery.gte('fecha_pago', fechaInicio);
    }
    if (fechaFin) {
      allPaymentsQuery = allPaymentsQuery.lte('fecha_pago', fechaFin);
    }

    const { data: allPayments } = await allPaymentsQuery;
    const totalCompletado = allPayments?.reduce((sum, p) => sum + (p.importe || 0), 0) || 0;

    // Calculate pending payments - Pendiente de Cobro (filtered by date range)
    // Get expedientes with payments in the filtered period
    let expedientesQuery = supabase
      .from('expedientes')
      .select(`
        id,
        precio_acordado,
        payments!inner(importe, fecha_pago)
      `);

    if (fechaInicio) {
      expedientesQuery = expedientesQuery.gte('payments.fecha_pago', fechaInicio);
    }
    if (fechaFin) {
      expedientesQuery = expedientesQuery.lte('payments.fecha_pago', fechaFin);
    }

    const { data: expedientes } = await expedientesQuery;

    let totalPendiente = 0;
    expedientes?.forEach((exp: any) => {
      const totalPagado = exp.payments?.reduce((sum: number, p: any) => sum + (p.importe || 0), 0) || 0;
      const pendiente = (exp.precio_acordado || 0) - totalPagado;
      if (pendiente > 0) {
        totalPendiente += pendiente;
      }
    });

    return {
      totalCompletado,
      totalPendiente,
      totalGeneral: totalCompletado + totalPendiente
    };
  },

  async getPendingPayments(fechaInicio?: string, fechaFin?: string) {
    // Get all expedientes with client info
    const { data: expedientes, error: expError } = await supabase
      .from('expedientes')
      .select(`
        id,
        numero_expediente,
        precio_acordado,
        cliente:clients (
          nombre,
          apellidos,
          empresa
        )
      `)
      .order('numero_expediente', { ascending: false });

    if (expError) throw expError;

    // Get payments for each expediente (filtered by date range)
    const expedientesWithPayments = await Promise.all(
      expedientes.map(async (exp) => {
        let query = supabase
          .from('payments')
          .select('importe, fecha_pago')
          .eq('expediente_id', exp.id);

        // Apply date filters if available
        if (fechaInicio) {
          query = query.gte('fecha_pago', fechaInicio);
        }
        if (fechaFin) {
          query = query.lte('fecha_pago', fechaFin);
        }

        const { data: payments } = await query;

        // Only include expedientes that have payments in the date range
        if (!payments || payments.length === 0) {
          return null;
        }

        const pagado = payments.reduce((sum, p) => sum + Number(p.importe), 0);
        const pendiente = Number(exp.precio_acordado) - pagado;

        // Only include if there's a pending amount
        if (pendiente <= 0) {
          return null;
        }

        return {
          id: exp.id,
          numero_expediente: exp.numero_expediente,
          cliente_nombre: exp.cliente?.empresa || 
            `${exp.cliente?.nombre || ''} ${exp.cliente?.apellidos || ''}`.trim(),
          precio_acordado: Number(exp.precio_acordado),
          pagado,
          pendiente,
          porcentaje: exp.precio_acordado > 0 
            ? (pagado / Number(exp.precio_acordado)) * 100 
            : 0
        };
      })
    );

    // Filter out null values
    return expedientesWithPayments.filter((exp): exp is NonNullable<typeof exp> => exp !== null);
  }
};
