import jsPDF from 'jspdf';

interface ReciboData {
  nombreGestoria: string;
  clienteNombre: string;
  clienteApellidos: string;
  clienteNIE: string;
  clienteTelefono?: string;
  clienteEmpresa?: string;
  numeroExpediente: string;
  tipoTramite: string;
  fechaInicio: string;
  importePago?: number;
  importeTotal: number;
  totalPagadoAnterior: number;
  totalPagado: number;
  importePendiente: number;
  fechaPago: string;
  metodoPago?: string;
  concepto?: string;
  pagoId?: string;
  plazos?: Array<{ numero: number; importe: number; concepto?: string }>;
}

export const generarReciboPDF = (data: ReciboData) => {
  const doc = new jsPDF();
  const pageWidth = 210;
  const margin = 20;
  
  // ENCABEZADO
  // Fecha emisión (izquierda)
  const now = new Date();
  const fechaEmision = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear().toString().slice(-2)}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(fechaEmision, margin, 15);
  
  // Recibo # (derecha)
  const reciboNum = data.numeroExpediente;
  doc.text(`Recibo #${reciboNum}`, pageWidth - margin, 15, { align: 'right' });
  
  // Encabezado empresa
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('ASESORÍA GEX', pageWidth / 2, 25, { align: 'center' });
  
  // Título RECIBO DE PAGO (centro)
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('RECIBO DE PAGO', pageWidth / 2, 35, { align: 'center' });
  
  // Subtítulo
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Recibo Nº ${reciboNum}`, pageWidth / 2, 43, { align: 'center' });
  doc.text(`Fecha de emisión: ${now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`, pageWidth / 2, 49, { align: 'center' });
  
  // Línea separadora
  doc.setLineWidth(0.5);
  doc.line(margin, 50, pageWidth - margin, 50);
  
  let y = 60;
  
  // SECCIÓN 1 - Datos del Cliente
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Datos del Cliente', margin, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre completo: ${data.clienteNombre} ${data.clienteApellidos}`, margin, y);
  y += 6;
  doc.text(`NIE/Pasaporte: ${data.clienteNIE}`, margin, y);
  y += 6;
  if (data.clienteEmpresa) {
    doc.text(`Empresa: ${data.clienteEmpresa}`, margin, y);
    y += 6;
  }
  if (data.clienteTelefono) {
    doc.text(`Teléfono: ${data.clienteTelefono}`, margin, y);
    y += 6;
  }
  
  y += 4;
  
  // SECCIÓN 2 - Datos del Expediente
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Datos del Expediente', margin, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nº Expediente: ${data.numeroExpediente}`, margin, y);
  y += 6;
  doc.text(`Tipo de Trámite: ${data.tipoTramite}`, margin, y);
  y += 6;
  doc.text(`Fecha de Inicio: ${data.fechaInicio}`, margin, y);
  y += 10;
  
  // SECCIÓN 3 - Detalles del Pago
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalles del Pago', margin, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha de Pago: ${data.fechaPago}`, margin, y);
  y += 6;
  doc.text(`Concepto: ${data.concepto || 'PAGO COMPLETO'}`, margin, y);
  y += 6;
  doc.text(`Método de Pago: ${data.metodoPago || '-'}`, margin, y);
  y += 10;
  
  // Línea separadora
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;
  
  // SECCIÓN 4 - Resumen Económico (alineado a la derecha)
  const rightAlign = pageWidth - margin;
  const labelX = rightAlign - 60;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  // Precio Acordado
  doc.text('Precio Acordado:', labelX, y);
  doc.text(`${data.importeTotal.toFixed(2)} €`, rightAlign, y, { align: 'right' });
  y += 7;
  
  // Este Pago (si hay pago actual)
  if (data.importePago) {
    doc.setTextColor(41, 98, 255); // Azul
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Este Pago:', labelX, y);
    doc.text(`${data.importePago.toFixed(2)} €`, rightAlign, y, { align: 'right' });
    y += 8;
    
    // Resetear color y fuente
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
  }
  
  // Total Pagado
  doc.text('Total Pagado:', labelX, y);
  doc.text(`${data.totalPagado.toFixed(2)} €`, rightAlign, y, { align: 'right' });
  y += 7;
  
  // Pendiente
  doc.setFont('helvetica', 'bold');
  doc.text('Pendiente:', labelX, y);
  doc.text(`${data.importePendiente.toFixed(2)} €`, rightAlign, y, { align: 'right' });
  
  y += 12;
  
  // Si hay plazos definidos, mostrarlos
  if (data.plazos && data.plazos.length > 0) {
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
    
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Plazos de Pago', margin, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    data.plazos.forEach((plazo) => {
      doc.text(`${plazo.numero}º Plazo: ${plazo.importe.toFixed(2)} €`, margin, y);
      if (plazo.concepto) {
        doc.setFont('helvetica', 'italic');
        doc.text(`(${plazo.concepto})`, margin + 50, y);
        doc.setFont('helvetica', 'normal');
      }
      y += 6;
    });
    
    y += 6;
  }
  
  // Línea separadora final
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  
  // PIE DE PÁGINA
  y += 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text('Este documento es un recibo de pago generado automáticamente.', pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.text('Para cualquier consulta, por favor contacte con Asesoría Gex.', pageWidth / 2, y, { align: 'center' });
  
  // Footer inferior
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const footerY = 285;
  doc.text(data.nombreGestoria, margin, footerY);
  doc.text('1/1', pageWidth - margin, footerY, { align: 'right' });
  
  // Generar y descargar
  const fileName = `Recibo_${data.numeroExpediente}_${reciboNum}.pdf`;
  doc.save(fileName);
};
