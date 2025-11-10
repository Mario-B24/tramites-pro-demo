import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useClients } from '@/hooks/useClients';
import { useTiposTramite } from '@/hooks/useTiposTramite';
import { useCreateExpediente } from '@/hooks/useExpedientes';

const expedienteSchema = z.object({
  cliente_id: z.string().min(1, 'Selecciona un cliente'),
  tipo_tramite_id: z.string().min(1, 'Selecciona un tipo de trámite'),
  numero_expediente: z.string().min(1, 'El número de expediente es obligatorio'),
  fecha_inicio: z.date({
    required_error: 'La fecha de inicio es obligatoria'
  }),
  estado: z.string().optional(),
  precio_acordado: z.string().optional(),
  numero_expediente_oficial: z.string().optional(),
  observaciones: z.string().optional()
});

type ExpedienteFormData = z.infer<typeof expedienteSchema>;

interface ExpedienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExpedienteDialog({ open, onOpenChange }: ExpedienteDialogProps) {
  const { toast } = useToast();
  const { data: clientes, isLoading: isLoadingClientes, refetch: refetchClientes } = useClients();
  const { data: tiposTramite, isLoading: isLoadingTipos } = useTiposTramite();
  const createExpediente = useCreateExpediente();
  
  const form = useForm<ExpedienteFormData>({
    resolver: zodResolver(expedienteSchema),
    defaultValues: {
      cliente_id: '',
      tipo_tramite_id: '',
      numero_expediente: '',
      fecha_inicio: new Date(),
      estado: 'pendiente_documentos',
      precio_acordado: '',
      numero_expediente_oficial: '',
      observaciones: ''
    }
  });

  const onSubmit = async (data: ExpedienteFormData) => {
    try {
      await createExpediente.mutateAsync({
        cliente_id: data.cliente_id,
        tipo_tramite_id: data.tipo_tramite_id,
        numero_expediente: data.numero_expediente,
        estado: data.estado || 'pendiente_documentos',
        fecha_inicio: format(data.fecha_inicio, 'yyyy-MM-dd'),
        precio_acordado: data.precio_acordado ? parseFloat(data.precio_acordado) : 0,
        numero_expediente_oficial: data.numero_expediente_oficial,
        observaciones: data.observaciones
      });
      
      form.reset({
        cliente_id: '',
        tipo_tramite_id: '',
        numero_expediente: '',
        fecha_inicio: new Date(),
        estado: 'pendiente_documentos',
        precio_acordado: '',
        numero_expediente_oficial: '',
        observaciones: ''
      });
      onOpenChange(false);
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleRefreshClientes = async () => {
    await refetchClientes();
    toast({
      title: 'Clientes actualizados',
      description: 'La lista de clientes se ha recargado correctamente.'
    });
  };

  // Auto-completar precio cuando se selecciona un tipo de trámite
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'tipo_tramite_id' && value.tipo_tramite_id) {
        const tipoSeleccionado = tiposTramite?.find(t => t.id === value.tipo_tramite_id);
        if (tipoSeleccionado?.precio_base) {
          form.setValue('precio_acordado', tipoSeleccionado.precio_base.toString());
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, tiposTramite]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Expediente</DialogTitle>
          <DialogDescription>
            Crea un nuevo expediente para un cliente
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cliente_id"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Cliente *</FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRefreshClientes}
                      disabled={isLoadingClientes}
                      className="h-8 px-2"
                    >
                      <RefreshCw className={cn("h-4 w-4", isLoadingClientes && "animate-spin")} />
                    </Button>
                  </div>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingClientes ? "Cargando clientes..." : "Selecciona un cliente"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clientes?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.nombre} {client.apellidos} - {client.nie || client.pasaporte || 'Sin documento'}
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
              name="tipo_tramite_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Trámite *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingTipos ? "Cargando tipos de trámite..." : "Selecciona un tipo de trámite"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tiposTramite?.filter(t => t.active).map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id}>
                          {tipo.nombre}
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
              name="numero_expediente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Expediente *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ej: 25/001" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fecha_inicio"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Inicio *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP', { locale: es })
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
                        className="p-3 pointer-events-auto"
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pendiente_documentos">Pendiente Documentos</SelectItem>
                      <SelectItem value="documentos_completos">Documentos Completos</SelectItem>
                      <SelectItem value="en_tramite">En Trámite</SelectItem>
                      <SelectItem value="presentado">Presentado</SelectItem>
                      <SelectItem value="resuelto_favorable">Resuelto Favorable</SelectItem>
                      <SelectItem value="resuelto_desfavorable">Resuelto Desfavorable</SelectItem>
                      <SelectItem value="archivado">Archivado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="precio_acordado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio Acordado (€)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numero_expediente_oficial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nº Expediente Oficial</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Número asignado por la administración" 
                      {...field} 
                    />
                  </FormControl>
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
                      placeholder="Observaciones adicionales sobre el expediente..."
                      className="min-h-[100px]"
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
              <Button type="submit" disabled={createExpediente.isPending}>
                {createExpediente.isPending ? 'Creando...' : 'Crear Expediente'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
