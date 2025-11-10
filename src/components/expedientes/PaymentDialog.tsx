import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const paymentSchema = z.object({
  importe: z.coerce.number().int('El importe debe ser un número entero').positive('El importe debe ser mayor a 0'),
  descuento: z.coerce.number().min(0, 'El descuento debe ser mayor o igual a 0').default(0),
  metodo_pago: z.enum(['efectivo', 'transferencia', 'tarjeta', 'cheque'], {
    required_error: 'Selecciona un método de pago',
  }),
  fecha_pago: z.string().min(1, 'La fecha es requerida'),
  concepto: z.string().optional(),
  numero_pago: z.string().optional(),
  observaciones: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expedienteId: string;
  onSuccess: () => void;
}

export function PaymentDialog({ open, onOpenChange, expedienteId, onSuccess }: PaymentDialogProps) {
  const { toast } = useToast();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      importe: 0,
      descuento: 0,
      metodo_pago: 'transferencia',
      fecha_pago: new Date().toISOString().split('T')[0],
      concepto: '',
      numero_pago: '',
      observaciones: '',
    },
  });

  const onSubmit = async (data: PaymentFormValues) => {
    try {
      // Obtener datos del expediente y cliente
      const { data: expediente, error: expError } = await supabase
        .from('expedientes')
        .select('cliente_id, precio_acordado')
        .eq('id', expedienteId)
        .single();

      if (expError) throw expError;

      // Insertar el pago con descuento
      const { error } = await supabase
        .from('payments')
        .insert([{
          expediente_id: expedienteId,
          cliente_id: expediente.cliente_id,
          importe: data.importe,
          descuento: data.descuento,
          metodo_pago: data.metodo_pago,
          fecha_pago: data.fecha_pago,
          concepto: data.concepto || null,
          numero_pago: data.numero_pago || null,
          observaciones: data.observaciones || null,
        }]);

      if (error) throw error;

      // Si hay descuento, actualizar el precio_acordado del expediente
      if (data.descuento > 0) {
        const nuevoPrecio = (expediente.precio_acordado || 0) - data.descuento;
        const { error: updateError } = await supabase
          .from('expedientes')
          .update({ precio_acordado: nuevoPrecio })
          .eq('id', expedienteId);

        if (updateError) throw updateError;
      }

      toast({
        title: 'Pago registrado',
        description: data.descuento > 0 
          ? `Pago registrado correctamente - Descuento de ${data.descuento}€ aplicado`
          : 'El pago se ha registrado correctamente',
      });

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo registrar el pago',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
          <DialogDescription>
            Completa el formulario para registrar un nuevo pago
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="importe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Importe (€) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      placeholder="0"
                      min="0"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow integers
                        if (value === '' || /^\d+$/.test(value)) {
                          field.onChange(e);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descuento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descuento (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0"
                      min="0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metodo_pago"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pago *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona método" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fecha_pago"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Pago *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="concepto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Concepto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Pago inicial, pago final..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numero_pago"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pago</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 1/2, 2/2" {...field} />
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
                      placeholder="Notas adicionales..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">Registrar Pago</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
