import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, FileText, Trash2 } from 'lucide-react';
import { HistorialEstado, estadosConfig } from '@/types/expediente';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
} from "@/components/ui/alert-dialog";
import { useDeleteHistorialEstado } from '@/hooks/useExpedientes';
import { toast } from 'sonner';
import { useState } from 'react';

interface ExpedienteTimelineProps {
  historial: HistorialEstado[];
  onCambiarEstado: () => void;
  expedienteId: string;
}

export function ExpedienteTimeline({ historial, onCambiarEstado, expedienteId }: ExpedienteTimelineProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleteHistorial = useDeleteHistorialEstado();

  const handleDelete = async (historialId: string) => {
    setDeletingId(historialId);
    try {
      await deleteHistorial.mutateAsync({ historialId, expedienteId });
      toast.success('Cambio de estado eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar cambio de estado:', error);
      toast.error('Error al eliminar el cambio de estado');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Historial de Estados</CardTitle>
            <CardDescription>Seguimiento de cambios del expediente</CardDescription>
          </div>
          <Button onClick={onCambiarEstado}>
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Cambiar Estado
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {historial.map((item, index) => (
            <div key={item.id} className="flex gap-4">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-primary' : 'bg-muted'}`} />
                {index < historial.length - 1 && (
                  <div className="w-0.5 h-full bg-border my-1" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {item.estado_anterior && (
                      <>
                        <Badge variant={estadosConfig[item.estado_anterior]?.variant || 'outline'}>
                          {estadosConfig[item.estado_anterior]?.label || item.estado_anterior}
                        </Badge>
                        <span className="text-muted-foreground">→</span>
                      </>
                    )}
                    <Badge variant={estadosConfig[item.estado_nuevo]?.variant || 'outline'}>
                      {estadosConfig[item.estado_nuevo]?.label || item.estado_nuevo}
                    </Badge>
                    {item.observaciones && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-sm">{item.observaciones}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(item.fecha), 'PPp', { locale: es })}
                    </span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          disabled={deletingId === item.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar cambio de estado?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará este cambio de estado del historial.
                            {index === 0 && ' El expediente volverá al estado anterior.'}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(item.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Por: <strong>{item.usuario}</strong>
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
