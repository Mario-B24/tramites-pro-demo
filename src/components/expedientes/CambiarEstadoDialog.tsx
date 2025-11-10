import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { EstadoExpediente, estadosConfig } from '@/types/expediente';
import { useCambiarEstado } from '@/hooks/useExpedientes';

const cambiarEstadoSchema = z.object({
  estado_nuevo: z.string().min(1, 'Selecciona un estado'),
  fecha_cambio: z.date({
    required_error: 'La fecha del cambio es obligatoria'
  }),
  observaciones: z.string().optional()
});

type CambiarEstadoFormData = z.infer<typeof cambiarEstadoSchema>;

interface CambiarEstadoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expedienteId: string;
  estadoActual: EstadoExpediente;
  onSuccess?: () => void;
}

export function CambiarEstadoDialog({ 
  open, 
  onOpenChange, 
  expedienteId, 
  estadoActual,
  onSuccess
}: CambiarEstadoDialogProps) {
  const [selectedEstado, setSelectedEstado] = useState<string>('');
  const cambiarEstado = useCambiarEstado();
  
  const form = useForm<CambiarEstadoFormData>({
    resolver: zodResolver(cambiarEstadoSchema),
    defaultValues: {
      estado_nuevo: '',
      fecha_cambio: new Date(),
      observaciones: ''
    }
  });

  const onSubmit = async (data: CambiarEstadoFormData) => {
    try {
      await cambiarEstado.mutateAsync({
        id: expedienteId,
        data: {
          estado_nuevo: data.estado_nuevo,
          fecha_cambio: format(data.fecha_cambio, 'yyyy-MM-dd'),
          observaciones: data.observaciones
        }
      });
      
      const nuevoEstadoConfig = estadosConfig[data.estado_nuevo as EstadoExpediente];
      
      toast.success('Estado actualizado', {
        description: `El expediente ha cambiado a: ${nuevoEstadoConfig?.label || data.estado_nuevo}`
      });
      
      form.reset({
        estado_nuevo: '',
        fecha_cambio: new Date(),
        observaciones: ''
      });
      setSelectedEstado('');
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Error al cambiar el estado', {
        description: 'No se pudo actualizar el estado del expediente'
      });
    }
  };

  const handleEstadoChange = (value: string) => {
    setSelectedEstado(value);
    form.setValue('estado_nuevo', value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar Estado del Expediente</DialogTitle>
          <DialogDescription>
            Estado actual: <strong>{estadosConfig[estadoActual]?.label || estadoActual}</strong>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="estado_nuevo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nuevo Estado *</FormLabel>
                  <Select onValueChange={handleEstadoChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(estadosConfig).map(([key, value]) => (
                        <SelectItem key={key} value={key} disabled={key === estadoActual}>
                          {value.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fecha_cambio"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha del Cambio *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Selecciona una fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="¿Por qué cambia el estado?"
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Guardar Cambio
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
