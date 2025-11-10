import { supabase } from '@/integrations/supabase/client';

export const dashboardService = {
  async getMetricas(fechaInicio?: string, fechaFin?: string) {
    // Total clients
    const { count: totalClientes } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });

    // New clients this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: nuevosClientesMes } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    // Active expedientes
    const { count: expedientesActivos } = await supabase
      .from('expedientes')
      .select('*', { count: 'exact', head: true })
      .not('estado', 'in', '("archivado","resuelto_favorable","resuelto_desfavorable")');

    // Pending expedientes
    const { count: expedientesPendientes } = await supabase
      .from('expedientes')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'pendiente_documentos');

    // Pending payments - only for expedientes with at least one payment
    const { data: expedientesData } = await supabase
      .from('expedientes')
      .select(`
        id,
        precio_acordado,
        payments(importe, fecha_pago)
      `);

    let pendienteCobro = 0;
    let expedientesConSaldo = 0;

    expedientesData?.forEach((exp: any) => {
      // Only consider expedientes that have at least one payment
      if (!exp.payments || exp.payments.length === 0) return;

      // Filter payments by date if dates are provided
      let payments = exp.payments;
      if (fechaInicio && fechaFin) {
        payments = payments.filter((p: any) => {
          const fechaPago = p.fecha_pago;
          return fechaPago >= fechaInicio && fechaPago <= fechaFin;
        });
      }

      const totalPagado = payments.reduce((sum: number, p: any) => sum + (p.importe || 0), 0);
      const pendiente = (exp.precio_acordado || 0) - totalPagado;
      if (pendiente > 0) {
        pendienteCobro += pendiente;
        expedientesConSaldo++;
      }
    });

    return {
      totalClientes: totalClientes || 0,
      nuevosClientesMes: nuevosClientesMes || 0,
      expedientesActivos: expedientesActivos || 0,
      expedientesPendientes: expedientesPendientes || 0,
      pendienteCobro,
      expedientesConSaldo
    };
  },

  async getExpedientesPorEstado() {
    const { data, error } = await supabase
      .from('expedientes')
      .select('estado');

    if (error) throw error;

    const estados = data?.reduce((acc: any, exp) => {
      acc[exp.estado] = (acc[exp.estado] || 0) + 1;
      return acc;
    }, {});

    const estadosColors: Record<string, string> = {
      'pendiente_documentos': '#eab308',
      'documentos_completos': '#3b82f6',
      'en_tramite': '#a855f7',
      'presentado': '#06b6d4',
      'resuelto_favorable': '#10b981',
      'resuelto_desfavorable': '#ef4444',
      'archivado': '#6b7280',
      'pendiente_presentar': '#f59e0b',
      'requerido': '#dc2626',
      'pendiente_tasas': '#8b5cf6'
    };

    return Object.entries(estados || {}).map(([estado, cantidad]) => ({
      estado,
      cantidad: cantidad as number,
      fill: estadosColors[estado] || '#6b7280'
    }));
  },

  async getIngresosMensuales() {
    // Last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      months.push(date);
    }

    const results = await Promise.all(
      months.map(async (startDate) => {
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setSeconds(endDate.getSeconds() - 1);

        const { data } = await supabase
          .from('payments')
          .select('importe')
          .gte('fecha_pago', startDate.toISOString())
          .lte('fecha_pago', endDate.toISOString());

        const total = data?.reduce((sum, p) => sum + p.importe, 0) || 0;

        return {
          mes: startDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
          ingresos: total
        };
      })
    );

    return results;
  },

  async getExpedientesRecientes(limit: number = 5) {
    const { data, error } = await supabase
      .from('expedientes')
      .select(`
        *,
        cliente:clients(nombre, apellidos, empresa),
        tipo_tramite:tipos_tramite(nombre)
      `)
      .in('estado', ['pendiente_presentar', 'requerido'])
      .order('fecha_inicio', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    return data?.map((exp: any) => ({
      id: exp.id,
      numero: exp.numero_expediente,
      cliente: `${exp.cliente?.nombre || ''} ${exp.cliente?.apellidos || ''}`.trim(),
      tramite: exp.tipo_tramite?.nombre || '',
      estado: exp.estado,
      fecha: exp.fecha_inicio
    })) || [];
  },

  async getPagosPendientes(limit: number = 5) {
    // Get expedientes with pending payments
    const { data, error } = await supabase
      .from('expedientes')
      .select(`
        id,
        numero_expediente,
        precio_acordado,
        fecha_inicio,
        cliente:clients(nombre, apellidos, empresa),
        payments(importe)
      `)
      .order('fecha_inicio', { ascending: false })
      .limit(limit * 3); // Get more to filter

    if (error) throw error;

    // Filter expedientes with pending amounts
    const pendingPayments = data
      ?.map((exp: any) => {
        const totalPagado = exp.payments?.reduce((sum: number, p: any) => sum + (p.importe || 0), 0) || 0;
        const pendiente = (exp.precio_acordado || 0) - totalPagado;
        if (pendiente <= 0) return null;
        
        const clienteNombre = exp.cliente?.empresa || `${exp.cliente?.nombre} ${exp.cliente?.apellidos || ''}`.trim();
        
        return {
          id: exp.id,
          cliente: clienteNombre,
          expediente: exp.numero_expediente,
          monto: pendiente,
          fechaVencimiento: exp.fecha_inicio,
          vencido: false // Could be calculated based on business rules
        };
      })
      .filter(Boolean)
      .slice(0, limit);

    return pendingPayments || [];
  },

  async getTiposTramite() {
    const { data, error } = await supabase
      .from('expedientes')
      .select(`
        tipo_tramite_id,
        tipo_tramite:tipos_tramite(nombre)
      `);

    if (error) throw error;

    const tramiteCounts = data?.reduce((acc: any, exp: any) => {
      const tramiteNombre = exp.tipo_tramite?.nombre;
      if (tramiteNombre) {
        acc[tramiteNombre] = (acc[tramiteNombre] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(tramiteCounts || {})
      .map(([nombre, cantidad]) => ({
        nombre,
        cantidad: cantidad as number
      }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }
};
