import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { PaymentDialog } from './PaymentDialog';
import { generarReciboPDF } from '@/utils/reciboGenerator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Pago {
  id: string;
  importe: number;
  fecha_pago: string;
  metodo_pago?: string;
  concepto?: string;
  numero_pago?: string;
}

interface PagosSectionProps {
  expedienteId: string;
  numeroExpediente: string;
  tipoTramite: string;
  fechaInicio: string;
  clienteNombre: string;
  clienteApellidos: string;
  clienteNIE: string;
  clienteTelefono?: string;
  clienteEmpresa?: string;
  precioAcordado: number;
  pagos: Pago[];
  nombreGestoria: string;
  onPagoRegistrado: () => void;
}

export function PagosSection({
  expedienteId,
  numeroExpediente,
  tipoTramite,
  fechaInicio,
  clienteNombre,
  clienteApellidos,
  clienteNIE,
  clienteTelefono,
  clienteEmpresa,
  precioAcordado,
  pagos,
  nombreGestoria,
  onPagoRegistrado
}: PagosSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pagoToDelete, setPagoToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const totalPagado = pagos.reduce((sum, pago) => sum + (pago.importe || 0), 0);
  const pendiente = precioAcordado - totalPagado;
  const porcentajePagado = precioAcordado > 0 ? (totalPagado / precioAcordado) * 100 : 0;

  const handleDescargarRecibo = (pago?: Pago) => {
    // Si es un pago específico, calcular totales hasta ese pago
    let totalPagadoRecibo: number;
    let pendienteRecibo: number;
    
    if (pago) {
      // Total pagado hasta este pago (incluyendo este)
      totalPagadoRecibo = pagos
        .filter(p => new Date(p.fecha_pago) <= new Date(pago.fecha_pago))
        .reduce((sum, p) => sum + p.importe, 0);
      pendienteRecibo = precioAcordado - totalPagadoRecibo;
    } else {
      // Recibo general: Total Pagado = 0, Pendiente = Precio Acordado
      totalPagadoRecibo = 0;
      pendienteRecibo = precioAcordado;
    }
    
    // Calcular plazos para el presupuesto (recibo general)
    let plazos: Array<{ numero: number; importe: number; concepto?: string }> | undefined;
    if (!pago && pagos.length > 0) {
      // Ordenar pagos por fecha
      const pagosOrdenados = [...pagos].sort((a, b) => 
        new Date(a.fecha_pago).getTime() - new Date(b.fecha_pago).getTime()
      );
      
      plazos = pagosOrdenados.map((p, index) => ({
        numero: index + 1,
        importe: p.importe,
        concepto: p.concepto
      }));
    }
    
    generarReciboPDF({
      nombreGestoria,
      clienteNombre,
      clienteApellidos,
      clienteNIE,
      clienteTelefono: clienteTelefono,
      clienteEmpresa: clienteEmpresa,
      numeroExpediente,
      tipoTramite,
      fechaInicio: fechaInicio,
      importePago: pago?.importe,
      importeTotal: precioAcordado,
      totalPagadoAnterior: 0,
      totalPagado: totalPagadoRecibo,
      importePendiente: pendienteRecibo,
      fechaPago: pago?.fecha_pago ? format(new Date(pago.fecha_pago), 'dd/MM/yyyy', { locale: es }) : format(new Date(), 'dd/MM/yyyy', { locale: es }),
      metodoPago: pago?.metodo_pago,
      concepto: pago?.concepto,
      pagoId: pago?.id,
      plazos: plazos,
    });
  };

  const handleDeletePago = async (pagoId: string) => {
    setPagoToDelete(pagoId);
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', pagoId);

      if (error) throw error;

      toast({
        title: 'Pago eliminado',
        description: 'El pago se ha eliminado correctamente',
      });

      onPagoRegistrado();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el pago',
        variant: 'destructive',
      });
    } finally {
      setPagoToDelete(null);
    }
  };

  const getMetodoPagoLabel = (metodo?: string) => {
    switch (metodo) {
      case 'efectivo': return 'Efectivo';
      case 'transferencia': return 'Transferencia';
      case 'tarjeta': return 'Tarjeta';
      case 'cheque': return 'Cheque';
      default: return metodo || '-';
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumen de Pagos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Resumen de Pagos</CardTitle>
              <CardDescription>Estado financiero del expediente</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleDescargarRecibo()}>
                <Download className="h-4 w-4 mr-2" />
                Descargar Recibo General
              </Button>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Pago
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Acordado</p>
                <p className="text-2xl font-bold">{precioAcordado.toFixed(2)} €</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pagado</p>
                <p className="text-2xl font-bold text-green-600">{totalPagado.toFixed(2)} €</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendiente</p>
                <p className="text-2xl font-bold text-orange-600">{pendiente.toFixed(2)} €</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso de Pago</span>
                <span className="font-medium">{porcentajePagado.toFixed(1)}%</span>
              </div>
              <Progress value={porcentajePagado} className="h-3" />
              {pendiente <= 0 && (
                <p className="text-sm font-medium text-green-600">✓ PAGADO COMPLETO</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historial de Pagos */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Pagos</CardTitle>
          <CardDescription>Registro de todos los pagos realizados</CardDescription>
        </CardHeader>
        <CardContent>
          {pagos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay pagos registrados</p>
              <Button 
                variant="link" 
                onClick={() => setDialogOpen(true)}
                className="mt-2"
              >
                Registrar el primer pago
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Importe</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  // Ordenar pagos por fecha para calcular el número de cada pago
                  const pagosOrdenados = [...pagos].sort((a, b) => 
                    new Date(a.fecha_pago).getTime() - new Date(b.fecha_pago).getTime()
                  );
                  const totalPagos = pagos.length;
                  
                  return pagosOrdenados.map((pago) => {
                    // Si el pago tiene numero_pago guardado, usarlo, si no calcularlo
                    const numeroPago = pago.numero_pago || 
                      (totalPagos > 1 ? `${pagosOrdenados.findIndex(p => p.id === pago.id) + 1}/${totalPagos}` : '-');
                    
                    return (
                      <TableRow key={pago.id}>
                        <TableCell>
                          {format(new Date(pago.fecha_pago), 'PP', { locale: es })}
                        </TableCell>
                        <TableCell className="font-medium">
                          {pago.importe.toFixed(2)} €
                        </TableCell>
                        <TableCell>{getMetodoPagoLabel(pago.metodo_pago)}</TableCell>
                        <TableCell>{pago.concepto || '-'}</TableCell>
                        <TableCell className="font-medium">
                          {numeroPago}
                        </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDescargarRecibo(pago)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Recibo
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={pagoToDelete === pago.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar este pago?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará el pago de {pago.importe.toFixed(2)} € del {format(new Date(pago.fecha_pago), 'PP', { locale: es })}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeletePago(pago.id)}>
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                      </TableRow>
                    );
                  });
                })()}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PaymentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        expedienteId={expedienteId}
        onSuccess={onPagoRegistrado}
      />
    </div>
  );
}
