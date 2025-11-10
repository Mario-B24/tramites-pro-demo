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
import { Payment } from '@/types/payment';
import { toast } from 'sonner';
import { useExpedientes } from '@/hooks/useExpedientes';

const paymentFormSchema = z.object({
  expediente_id: z.string().min(1, 'Selecciona un expediente'),
  monto: z.coerce.number().int('El monto debe ser un número entero').positive('El monto debe ser mayor a 0'),
  metodo_pago: z.enum(['efectivo', 'transferencia', 'tarjeta', 'cheque'], {
    required_error: 'Selecciona un método de pago',
  }),
  fecha_pago: z.string().refine((date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate <= today;
  }, 'La fecha no puede ser futura'),
  notas: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: Payment;
  onSave: (payment: Partial<Payment>) => void;
}

export function PaymentForm({ open, onOpenChange, payment, onSave }: PaymentFormProps) {
  const { data: expedientes = [] } = useExpedientes();
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      expediente_id: payment?.expediente_id || '',
      monto: payment?.monto || 0,
      metodo_pago: payment?.metodo_pago || 'transferencia',
      fecha_pago: payment?.fecha_pago || new Date().toISOString().split('T')[0],
      notas: payment?.notas || '',
    },
  });

  const onSubmit = (data: PaymentFormValues) => {
    // Find expediente info
    const expediente = expedientes.find((e: any) => e.id === data.expediente_id);
    const tipoTramiteNombre = expediente?.tipo_tramite?.nombre || '';
    const clienteNombre = expediente?.cliente?.empresa || 
      `${expediente?.cliente?.nombre || ''} ${(expediente?.cliente as any)?.apellidos || ''}`.trim();

    const paymentData: Partial<Payment> = {
      ...data,
      expediente_nombre: tipoTramiteNombre,
      cliente_nombre: clienteNombre,
      estado: 'completado', // Default status for new payments
    };

    if (payment) {
      paymentData.id = payment.id;
    }

    onSave(paymentData);
    toast.success(payment ? 'Pago actualizado correctamente' : 'Pago registrado correctamente');
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{payment ? 'Editar Pago' : 'Registrar Pago'}</DialogTitle>
          <DialogDescription>
            {payment ? 'Modifica los datos del pago' : 'Completa el formulario para registrar un nuevo pago'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="expediente_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expediente *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un expediente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {expedientes.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">No hay expedientes disponibles</div>
                      ) : (
                        expedientes.map((exp: any) => {
                          const clienteNombre = exp.cliente?.empresa || 
                            `${exp.cliente?.nombre || ''} ${(exp.cliente as any)?.apellidos || ''}`.trim();
                          return (
                            <SelectItem key={exp.id} value={exp.id}>
                              {exp.numero_expediente} - {exp.tipo_tramite?.nombre} - {clienteNombre}
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto (€) *</FormLabel>
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
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observaciones adicionales..."
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
              <Button type="submit">
                {payment ? 'Actualizar' : 'Registrar Pago'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
