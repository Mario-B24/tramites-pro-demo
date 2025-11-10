import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { parse, isValid, format } from 'date-fns';
import type { Client } from '@/types/client';
import { useCreateClient, useUpdateClient } from '@/hooks/useClients';

const clientSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellidos: z.string().min(2, 'Los apellidos deben tener al menos 2 caracteres'),
  empresa: z.string().optional(),
  telefono: z.string().optional(),
  nacionalidad: z.string().optional(),
  nie: z.string().optional(),
  pasaporte: z.string().optional(),
  fecha_vencimiento_nie: z.date().optional(),
  fecha_nacimiento: z.date().optional(),
  tipo_via: z.string().optional(),
  calle: z.string().optional(),
  numero: z.string().optional(),
  piso: z.string().optional(),
  puerta: z.string().optional(),
  observaciones: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
  onSave?: () => void;
}


export function ClientDialog({ open, onOpenChange, client, onSave }: ClientDialogProps) {
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: client
      ? {
          nombre: client.nombre,
          apellidos: client.apellidos,
          empresa: client.empresa || '',
          telefono: client.telefono || '',
          nacionalidad: client.nacionalidad || '',
          nie: client.nie || '',
          pasaporte: client.pasaporte || '',
          fecha_vencimiento_nie: client.fecha_vencimiento_nie
            ? new Date(client.fecha_vencimiento_nie)
            : undefined,
          fecha_nacimiento: client.fecha_nacimiento ? new Date(client.fecha_nacimiento) : undefined,
          tipo_via: client.tipo_via || '',
          calle: client.calle || '',
          numero: client.numero || '',
          piso: client.piso || '',
          puerta: client.puerta || '',
          observaciones: client.observaciones || '',
        }
      : {},
  });


  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleDateInput = (value: string, field: 'fecha_vencimiento_nie' | 'fecha_nacimiento') => {
    if (value.length === 0) {
      setValue(field, undefined);
      return;
    }

    if (value.length === 10) {
      const parsedDate = parse(value, 'dd/MM/yyyy', new Date());
      if (isValid(parsedDate)) {
        setValue(field, parsedDate);
      }
    }
  };

  const onSubmit = async (data: ClientFormData) => {
    // Convert dates to YYYY-MM-DD format to avoid timezone issues
    const clientData = {
      ...data,
      fecha_vencimiento_nie: data.fecha_vencimiento_nie ? format(data.fecha_vencimiento_nie, 'yyyy-MM-dd') : undefined,
      fecha_nacimiento: data.fecha_nacimiento ? format(data.fecha_nacimiento, 'yyyy-MM-dd') : undefined,
    };

    if (client) {
      await updateClient.mutateAsync({ id: client.id, data: clientData });
    } else {
      await createClient.mutateAsync(clientData as any);
    }
    
    handleClose();
    onSave?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input id="nombre" {...register('nombre')} />
              {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellidos">
                Apellidos <span className="text-destructive">*</span>
              </Label>
              <Input id="apellidos" {...register('apellidos')} />
              {errors.apellidos && <p className="text-sm text-destructive">{errors.apellidos.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="empresa">Empresa</Label>
            <Input id="empresa" {...register('empresa')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" {...register('telefono')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nacionalidad">Nacionalidad</Label>
              <Input 
                id="nacionalidad" 
                {...register('nacionalidad')} 
                placeholder="Ej: Española, Marroquí, Colombiana..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nie">NIE</Label>
              <Input id="nie" {...register('nie')} />
              {errors.nie && (
                <p className="text-sm text-destructive">{errors.nie.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pasaporte">Pasaporte</Label>
              <Input id="pasaporte" {...register('pasaporte')} />
              {errors.pasaporte && (
                <p className="text-sm text-destructive">{errors.pasaporte.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha_vencimiento_nie">Fecha vencimiento NIE</Label>
              <Input
                id="fecha_vencimiento_nie"
                onChange={(e) => handleDateInput(e.target.value, 'fecha_vencimiento_nie')}
                placeholder="DD/MM/YYYY"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_nacimiento">Fecha de nacimiento</Label>
              <Input
                id="fecha_nacimiento"
                onChange={(e) => handleDateInput(e.target.value, 'fecha_nacimiento')}
                placeholder="DD/MM/YYYY"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold">Dirección</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo_via">Tipo de vía</Label>
                <Input 
                  id="tipo_via" 
                  {...register('tipo_via')} 
                  placeholder="Ej: Avenida, Calle, Rambla, Plaza..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calle">Calle</Label>
                <Input id="calle" {...register('calle')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input id="numero" {...register('numero')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="piso">Piso</Label>
                <Input id="piso" {...register('piso')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="puerta">Puerta</Label>
                <Input id="puerta" {...register('puerta')} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea id="observaciones" {...register('observaciones')} rows={3} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">{client ? 'Actualizar' : 'Crear'} Cliente</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
