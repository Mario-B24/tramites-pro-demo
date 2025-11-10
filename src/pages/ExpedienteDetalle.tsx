import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Edit, Save, X, Trash2 } from 'lucide-react';
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
import { estadosConfig, EstadoExpediente } from '@/types/expediente';
import { ExpedienteTimeline } from '@/components/expedientes/ExpedienteTimeline';
import { DocumentosSection } from '@/components/expedientes/DocumentosSection';
import { CambiarEstadoDialog } from '@/components/expedientes/CambiarEstadoDialog';
import { PagosSection } from '@/components/expedientes/PagosSection';
import { ClienteDataSection } from '@/components/expedientes/ClienteDataSection';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useExpediente, useHistorialEstados, useUpdateExpediente, useDeleteExpediente } from '@/hooks/useExpedientes';
import { usePayments } from '@/hooks/usePayments';
import { useConfig } from '@/hooks/useConfig';
import { toast } from 'sonner';

export default function ExpedienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showCambiarEstado, setShowCambiarEstado] = useState(false);
  const [editingNumOficial, setEditingNumOficial] = useState(false);
  const [numOficialValue, setNumOficialValue] = useState('');

  // Fetch data from Supabase
  const { data: expediente, isLoading: loadingExpediente, refetch: refetchExpediente } = useExpediente(id || '');
  const { data: expedienteHistorial = [], refetch: refetchHistorial } = useHistorialEstados(id || '');
  const { data: allPayments = [], refetch: refetchPayments } = usePayments();
  const { data: config } = useConfig();
  const updateExpediente = useUpdateExpediente();
  const deleteExpediente = useDeleteExpediente();
  
  // Filter payments for this expediente
  const pagos = allPayments.filter((p: any) => p.expediente_id === id);

  // Map historial to expected type
  const historial = expedienteHistorial.map((h: any) => ({
    id: h.id,
    expediente_id: h.expediente_id,
    estado_anterior: h.estado_anterior as EstadoExpediente | null,
    estado_nuevo: h.estado_nuevo as EstadoExpediente,
    fecha: h.fecha_cambio,
    usuario: 'Usuario',
    observaciones: undefined
  }));

  const handlePagoRegistrado = () => {
    refetchPayments();
    refetchExpediente();
  };

  const handleEstadoCambiado = () => {
    refetchExpediente();
    refetchHistorial();
    setShowCambiarEstado(false);
  };

  const handleEditNumOficial = () => {
    setNumOficialValue(expediente?.numero_expediente_oficial || '');
    setEditingNumOficial(true);
  };

  const handleCancelNumOficial = () => {
    setEditingNumOficial(false);
    setNumOficialValue('');
  };

  const handleSaveNumOficial = async () => {
    if (!id) return;
    
    try {
      await updateExpediente.mutateAsync({
        id,
        data: { numero_expediente_oficial: numOficialValue || null }
      });
      toast.success('Número de expediente oficial actualizado');
      setEditingNumOficial(false);
      refetchExpediente();
    } catch (error) {
      toast.error('Error al actualizar el número de expediente oficial');
    }
  };

  const handleDeleteExpediente = async () => {
    if (!id) return;
    
    try {
      await deleteExpediente.mutateAsync(id);
      toast.success('Expediente eliminado correctamente');
      navigate('/expedientes');
    } catch (error) {
      toast.error('Error al eliminar el expediente');
    }
  };

  if (loadingExpediente) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Cargando...</h2>
        </div>
      </div>
    );
  }

  if (!expediente || !id) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Expediente no encontrado</h2>
          <Button className="mt-4" onClick={() => navigate('/expedientes')}>
            Volver a Expedientes
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/expedientes')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Expediente {expediente.numero_expediente}</h1>
            <p className="text-muted-foreground">
              {expediente.cliente?.nombre} {expediente.cliente?.apellidos || ''}
            </p>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Expediente
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar expediente?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente el expediente {expediente.numero_expediente} y todos sus datos asociados (documentos, pagos, historial).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteExpediente} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{expediente.tipo_tramite?.nombre}</CardTitle>
              <CardDescription>Código: {expediente.tipo_tramite?.codigo}</CardDescription>
            </div>
            <Badge 
              variant={estadosConfig[expediente.estado as EstadoExpediente]?.variant || 'outline'} 
              className="text-lg px-4 py-2"
            >
              {estadosConfig[expediente.estado as EstadoExpediente]?.label || expediente.estado}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Cliente</p>
              <p className="font-medium">{expediente.cliente?.nombre} {expediente.cliente?.apellidos || ''}</p>
              <p className="text-sm text-muted-foreground">{expediente.cliente?.nie || expediente.cliente?.pasaporte || ''}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha Inicio</p>
              <p className="font-medium">{format(new Date(expediente.fecha_inicio), 'PP', { locale: es })}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Precio Acordado</p>
              <p className="font-medium">
                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(expediente.precio_acordado)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nº Expediente Oficial</p>
              {editingNumOficial ? (
                <div className="flex gap-2 items-center mt-1">
                  <Input
                    value={numOficialValue}
                    onChange={(e) => setNumOficialValue(e.target.value)}
                    placeholder="Ingrese número oficial"
                    className="h-8 max-w-[200px]"
                  />
                  <Button size="sm" variant="default" onClick={handleSaveNumOficial}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancelNumOficial}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <p className="font-medium">{expediente.numero_expediente_oficial || '-'}</p>
                  <Button size="sm" variant="ghost" onClick={handleEditNumOficial}>
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            {expediente.estado === 'presentado' && expediente.fecha_presentacion_real && (
              <div>
                <p className="text-sm text-muted-foreground">Fecha Real de Presentación</p>
                <p className="font-medium">{format(new Date(expediente.fecha_presentacion_real), 'PP', { locale: es })}</p>
              </div>
            )}
          </div>
          {expediente.observaciones && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">Observaciones</p>
              <p className="mt-1">{expediente.observaciones}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="pagos">Pagos</TabsTrigger>
          <TabsTrigger value="datos">Datos del Cliente</TabsTrigger>
        </TabsList>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <ExpedienteTimeline 
            historial={historial}
            onCambiarEstado={() => setShowCambiarEstado(true)}
            expedienteId={id}
          />
        </TabsContent>

        {/* Documentos Tab */}
        <TabsContent value="documentos" className="space-y-4">
          <DocumentosSection 
            expedienteId={expediente.id}
            tipoTramiteId={expediente.tipo_tramite_id}
          />
        </TabsContent>

        {/* Pagos Tab */}
        <TabsContent value="pagos" className="space-y-4">
          <PagosSection
            expedienteId={expediente.id}
            numeroExpediente={expediente.numero_expediente}
            tipoTramite={expediente.tipo_tramite?.nombre || ''}
            fechaInicio={format(new Date(expediente.fecha_inicio), 'dd/MM/yyyy', { locale: es })}
            clienteNombre={expediente.cliente?.nombre || ''}
            clienteApellidos={expediente.cliente?.apellidos || ''}
            clienteNIE={expediente.cliente?.nie || expediente.cliente?.pasaporte || ''}
            clienteTelefono={expediente.cliente?.telefono}
            clienteEmpresa={expediente.cliente?.empresa}
            precioAcordado={expediente.precio_acordado || 0}
            pagos={pagos}
            nombreGestoria={config?.nombre_gestoria || 'GESTORIA GEX'}
            onPagoRegistrado={handlePagoRegistrado}
          />
        </TabsContent>

        {/* Datos del Cliente Tab */}
        <TabsContent value="datos" className="space-y-4">
          <ClienteDataSection 
            cliente={expediente.cliente || {
              nombre: ''
            }} 
          />
        </TabsContent>
      </Tabs>

      {/* Dialog Cambiar Estado */}
      <CambiarEstadoDialog
        open={showCambiarEstado}
        onOpenChange={setShowCambiarEstado}
        expedienteId={expediente.id}
        estadoActual={expediente.estado as EstadoExpediente}
        onSuccess={handleEstadoCambiado}
      />
    </div>
  );
}
