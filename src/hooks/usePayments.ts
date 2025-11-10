import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsService, PaymentData } from '@/services/paymentsService';
import { toast } from 'sonner';

export function usePayments(fechaInicio?: string, fechaFin?: string) {
  return useQuery({
    queryKey: ['payments', fechaInicio, fechaFin],
    queryFn: () => paymentsService.getAll(fechaInicio, fechaFin)
  });
}

export function usePaymentsByExpediente(expedienteId: string) {
  return useQuery({
    queryKey: ['payments', 'expediente', expedienteId],
    queryFn: () => paymentsService.getByExpediente(expedienteId),
    enabled: !!expedienteId
  });
}

export function usePaymentStats(fechaInicio?: string, fechaFin?: string) {
  return useQuery({
    queryKey: ['payments', 'stats', fechaInicio, fechaFin],
    queryFn: () => paymentsService.getStats(fechaInicio, fechaFin),
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PaymentData) => paymentsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Pago registrado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al registrar pago');
    }
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PaymentData> }) =>
      paymentsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Pago actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar pago');
    }
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => paymentsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Pago eliminado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar pago');
    }
  });
}

export function usePendingPayments(fechaInicio?: string, fechaFin?: string) {
  return useQuery({
    queryKey: ['pending-payments', fechaInicio, fechaFin],
    queryFn: () => paymentsService.getPendingPayments(fechaInicio, fechaFin)
  });
}
