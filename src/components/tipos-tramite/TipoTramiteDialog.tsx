import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { TipoTramite, DocumentoFormItem } from '@/types/tramite';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTipoTramite } from '@/hooks/useTiposTramite';
import { useEffect } from 'react';

const tipoTramiteSchema = z.object({
  nombre: z.string().min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100 caracteres'),
  codigo: z.string()
    .min(2, 'Mínimo 2 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'Solo mayúsculas, números y guiones'),
  precio_base: z.number().min(0, 'El precio debe ser positivo').optional(),
  active: z.boolean().default(true),
});

type TipoTramiteFormValues = z.infer<typeof tipoTramiteSchema>;

interface TipoTramiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoTramite?: TipoTramite | null;
  onSave: (data: TipoTramiteFormValues & { documentos: DocumentoFormItem[] }) => void;
}

export function TipoTramiteDialog({ open, onOpenChange, tipoTramite, onSave }: TipoTramiteDialogProps) {
  const [documentos, setDocumentos] = useState<DocumentoFormItem[]>([
    { nombre_documento: '', descripcion: '', orden: 1, active: true, obligatorio: true, temp_id: '1' }
  ]);
  
  // Fetch existing documents when editing
  const { data: tipoData } = useTipoTramite(tipoTramite?.id || '');
  
  // Load documents when editing
  useEffect(() => {
    if (tipoTramite && tipoData?.documentos_requeridos) {
      const existingDocs = tipoData.documentos_requeridos.map((doc: any) => ({
        id: doc.id,
        nombre_documento: doc.nombre_documento,
        descripcion: doc.descripcion || '',
        orden: doc.orden,
        active: doc.active,
        obligatorio: doc.obligatorio,
        temp_id: doc.id,
      }));
      setDocumentos(existingDocs.length > 0 ? existingDocs : [
        { nombre_documento: '', descripcion: '', orden: 1, active: true, obligatorio: true, temp_id: '1' }
      ]);
    } else if (!tipoTramite && open) {
      // Reset for new tipo
      setDocumentos([
        { nombre_documento: '', descripcion: '', orden: 1, active: true, obligatorio: true, temp_id: '1' }
      ]);
    }
  }, [tipoTramite, tipoData, open]);

  const form = useForm<TipoTramiteFormValues>({
    resolver: zodResolver(tipoTramiteSchema),
    defaultValues: {
      nombre: tipoTramite?.nombre || '',
      codigo: tipoTramite?.codigo || '',
      precio_base: tipoTramite?.precio_base || 0,
      active: tipoTramite?.active ?? true,
    },
  });

  const handleCodigoChange = (value: string) => {
    // Convert to uppercase and replace spaces with hyphens
    const formattedValue = value.toUpperCase().replace(/\s+/g, '-');
    form.setValue('codigo', formattedValue);
  };

  const addDocumento = () => {
    const nextOrden = documentos.length + 1;
    setDocumentos([
      ...documentos,
      { 
        nombre_documento: '', 
        descripcion: '', 
        orden: nextOrden, 
        active: true,
        obligatorio: true,
        temp_id: Date.now().toString()
      }
    ]);
  };

  const removeDocumento = (index: number) => {
    const newDocs = documentos.filter((_, i) => i !== index);
    // Reorder
    const reordered = newDocs.map((doc, i) => ({ ...doc, orden: i + 1 }));
    setDocumentos(reordered);
  };

  const moveDocumento = (index: number, direction: 'up' | 'down') => {
    const newDocs = [...documentos];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newDocs.length) return;
    
    // Swap
    [newDocs[index], newDocs[targetIndex]] = [newDocs[targetIndex], newDocs[index]];
    
    // Reorder
    const reordered = newDocs.map((doc, i) => ({ ...doc, orden: i + 1 }));
    setDocumentos(reordered);
  };

  const updateDocumento = (index: number, field: keyof DocumentoFormItem, value: any) => {
    const newDocs = [...documentos];
    newDocs[index] = { ...newDocs[index], [field]: value };
    setDocumentos(newDocs);
  };

  const handleSubmit = (data: TipoTramiteFormValues) => {
    console.log('=== handleSubmit TipoTramiteDialog ===');
    console.log('Datos del formulario:', data);
    console.log('Documentos en estado:', documentos);

    // Validate at least one document
    const validDocs = documentos.filter(d => d.nombre_documento.trim() !== '');
    console.log('Documentos válidos:', validDocs);

    if (validDocs.length === 0) {
      toast.error('Debes agregar al menos un documento requerido');
      return;
    }

    // Ensure all required fields are present
    const docsWithDefaults = validDocs.map((doc, index) => ({
      id: doc.id,
      nombre_documento: doc.nombre_documento.trim(),
      descripcion: doc.descripcion || '',
      orden: doc.orden || (index + 1),
      active: doc.active ?? true,
      obligatorio: doc.obligatorio ?? true,
      temp_id: doc.temp_id
    }));

    console.log('Documentos preparados para enviar:', docsWithDefaults);

    const formDataToSave = {
      ...data,
      documentos: docsWithDefaults
    };

    console.log('Datos completos a guardar:', formDataToSave);

    onSave(formDataToSave);
    onOpenChange(false);
    form.reset();
    setDocumentos([{ nombre_documento: '', descripcion: '', orden: 1, active: true, obligatorio: true, temp_id: '1' }]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {tipoTramite ? 'Editar Tipo de Trámite' : 'Nuevo Tipo de Trámite'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Renovación de NIE" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ej: NIE-REN" 
                        {...field}
                        onChange={(e) => handleCodigoChange(e.target.value)}
                        className="uppercase"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="precio_base"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio Base (€)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
            </div>

            <Separator />

            {/* Documents Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Documentos Requeridos
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDocumento}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Documento
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {documentos.map((doc, index) => (
                  <Card key={doc.temp_id || index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Documento #{doc.orden}</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveDocumento(index, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveDocumento(index, 'down')}
                            disabled={index === documentos.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocumento(index)}
                            disabled={documentos.length === 1}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        <div>
                          <Label className="text-xs">Nombre del Documento *</Label>
                          <Input
                            value={doc.nombre_documento}
                            onChange={(e) => updateDocumento(index, 'nombre_documento', e.target.value)}
                            placeholder="Ej: Pasaporte vigente"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-xs">Descripción</Label>
                          <Textarea
                            value={doc.descripcion}
                            onChange={(e) => updateDocumento(index, 'descripcion', e.target.value)}
                            placeholder="Ej: Pasaporte con mínimo 6 meses de validez"
                            rows={2}
                            className="mt-1"
                          />
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Obligatorio</Label>
                            <Switch
                              checked={doc.obligatorio}
                              onCheckedChange={(checked) => updateDocumento(index, 'obligatorio', checked)}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Activo</Label>
                            <Switch
                              checked={doc.active}
                              onCheckedChange={(checked) => updateDocumento(index, 'active', checked)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {tipoTramite ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
