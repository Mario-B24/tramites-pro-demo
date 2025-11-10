import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { DocumentoRequerido } from '@/types/tramite';
import { useTiposTramite } from '@/hooks/useTiposTramite';

const documentoSchema = z.object({
  tipo_tramite_id: z.string().min(1, 'Selecciona un tipo de trámite'),
  nombre_documento: z.string().min(3, 'Mínimo 3 caracteres').max(200, 'Máximo 200 caracteres'),
  descripcion: z.string().max(500, 'Máximo 500 caracteres').optional(),
  orden: z.number().min(1, 'El orden debe ser al menos 1'),
  active: z.boolean().default(true),
});

type DocumentoFormValues = z.infer<typeof documentoSchema>;

interface DocumentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documento?: DocumentoRequerido | null;
  onSave: (data: DocumentoFormValues) => void;
  defaultTipoTramiteId?: string;
}

export function DocumentoDialog({ 
  open, 
  onOpenChange, 
  documento, 
  onSave,
  defaultTipoTramiteId 
}: DocumentoDialogProps) {
  const form = useForm<DocumentoFormValues>({
    resolver: zodResolver(documentoSchema),
    defaultValues: {
      tipo_tramite_id: documento?.tipo_tramite_id || defaultTipoTramiteId || '',
      nombre_documento: documento?.nombre_documento || '',
      descripcion: documento?.descripcion || '',
      orden: documento?.orden || 1,
      active: documento?.active ?? true,
    },
  });

  const handleSubmit = (data: DocumentoFormValues) => {
    onSave(data);
    onOpenChange(false);
    form.reset();
    toast.success(documento ? 'Documento actualizado' : 'Documento creado');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {documento ? 'Editar Documento Requerido' : 'Nuevo Documento Requerido'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tipo_tramite_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Trámite *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo de trámite" />
                      </SelectTrigger>
                    </FormControl>
                     <SelectContent>
                       {(useTiposTramite().data || [])
                         .filter((t: any) => t.active)
                         .map((tipo: any) => (
                           <SelectItem key={tipo.id} value={tipo.id}>
                             {tipo.nombre} ({tipo.codigo})
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
              name="nombre_documento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Documento *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Pasaporte vigente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ej: Pasaporte con mínimo 6 meses de validez" 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orden"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orden</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Activo</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {documento ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
