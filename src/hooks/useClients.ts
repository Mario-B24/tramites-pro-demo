import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsService, ClientData } from '@/services/clientsService';
import { toast } from 'sonner';
import { useUserRole } from './useUserRole';
import { supabase } from '@/integrations/supabase/client';

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: clientsService.getAll
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => clientsService.getById(id),
    enabled: !!id
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ClientData) => clientsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Cliente creado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear cliente');
    }
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClientData> }) =>
      clientsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Cliente actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar cliente');
    }
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Cliente eliminado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar cliente');
    }
  });
}

export function useClientExpedientes(clienteId: string) {
  return useQuery({
    queryKey: ['client-expedientes', clienteId],
    queryFn: () => clientsService.getExpedientes(clienteId),
    enabled: !!clienteId
  });
}

export function useClientPayments(clienteId: string) {
  return useQuery({
    queryKey: ['client-payments', clienteId],
    queryFn: () => clientsService.getPayments(clienteId),
    enabled: !!clienteId
  });
}
