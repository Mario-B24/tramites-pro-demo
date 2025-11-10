import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useClient, useClientExpedientes, useClientPayments, useDeleteClient } from '@/hooks/useClients';
import { ClientDialog } from '@/components/clientes/ClientDialog';
import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ClienteDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: client, isLoading } = useClient(id || '');
  const { data: expedientes = [], isLoading: loadingExpedientes } = useClientExpedientes(id || '');
  const { data: payments = [], isLoading: loadingPayments } = useClientPayments(id || '');
  const deleteClientMutation = useDeleteClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
  };

  const totalPagado = payments.reduce((sum, payment) => sum + (payment.importe || 0), 0);

  const handleDelete = () => {
    if (!id) return;
    deleteClientMutation.mutate(id, {
      onSuccess: () => {
        navigate('/clientes');
      }
    });
  };

  const handleExpedienteClick = (expedienteId: string) => {
    navigate(`/expedientes/${expedienteId}`);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Cliente no encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/clientes')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {client.nombre} {client.apellidos}
            </h1>
            <p className="text-muted-foreground">{client.nie || client.pasaporte || 'Sin documento'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setDialogOpen(true)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Información Personal */}
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nombre Completo</p>
              <p className="font-medium">{client.nombre} {client.apellidos}</p>
            </div>
            {client.empresa && (
              <div>
                <p className="text-sm text-muted-foreground">Empresa</p>
                <p className="font-medium">{client.empresa}</p>
              </div>
            )}
            {client.nie && (
              <div>
                <p className="text-sm text-muted-foreground">NIE</p>
                <p className="font-medium">{client.nie}</p>
              </div>
            )}
            {client.pasaporte && (
              <div>
                <p className="text-sm text-muted-foreground">Pasaporte</p>
                <p className="font-medium">{client.pasaporte}</p>
              </div>
            )}
            {client.telefono && (
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="font-medium">{client.telefono}</p>
              </div>
            )}
            {client.nacionalidad && (
              <div>
                <p className="text-sm text-muted-foreground">Nacionalidad</p>
                <p className="font-medium">{client.nacionalidad}</p>
              </div>
            )}
            {client.fecha_nacimiento && (
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Nacimiento</p>
                <p className="font-medium">{formatDate(client.fecha_nacimiento)}</p>
              </div>
            )}
            {client.fecha_vencimiento_nie && (
              <div>
                <p className="text-sm text-muted-foreground">Vencimiento NIE</p>
                <p className="font-medium">{formatDate(client.fecha_vencimiento_nie)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dirección */}
      {(client.calle || client.numero || client.piso || client.puerta) && (
        <Card>
          <CardHeader>
            <CardTitle>Dirección</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {[
                client.calle,
                client.numero && `nº ${client.numero}`,
                client.piso && `${client.piso}º`,
                client.puerta
              ].filter(Boolean).join(', ')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Observaciones */}
      {client.observaciones && (
        <Card>
          <CardHeader>
            <CardTitle>Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{client.observaciones}</p>
          </CardContent>
        </Card>
      )}

      {/* Expedientes */}
      <Card>
        <CardHeader>
          <CardTitle>Expedientes ({expedientes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingExpedientes ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Cargando expedientes...</p>
            </div>
          ) : expedientes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay expedientes registrados</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expedientes.map((expediente: any) => (
                    <TableRow
                      key={expediente.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleExpedienteClick(expediente.id)}
                    >
                      <TableCell className="font-medium">
                        {expediente.numero_expediente}
                      </TableCell>
                      <TableCell>
                        {expediente.tipo_tramite?.nombre || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {expediente.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(expediente.fecha_inicio)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(expediente.precio_acordado || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historial de Pagos */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Pagos ({payments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingPayments ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Cargando pagos...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay pagos registrados</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Concepto</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead className="text-right">Importe</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment: any) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {formatDate(payment.fecha_pago)}
                        </TableCell>
                        <TableCell>
                          {payment.expediente?.numero_expediente || '-'}
                          {payment.expediente?.tipo_tramite?.nombre && (
                            <span className="text-muted-foreground text-sm block">
                              {payment.expediente.tipo_tramite.nombre}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="capitalize">
                          {payment.metodo_pago}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(payment.importe)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex justify-end">
                <div className="bg-muted px-4 py-2 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Pagado</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalPagado)}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <ClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={client}
        onSave={() => setDialogOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente al cliente "{client.nombre} {client.apellidos}" 
              y todos sus datos asociados. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClienteDetalle;
