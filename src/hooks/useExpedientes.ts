import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expedientesService, ExpedienteData, CambiarEstadoData } from '@/services/expedientesService';
import { toast } from 'sonner';

export function useExpedientes() {
  return useQuery({
    queryKey: ['expedientes'],
    queryFn: expedientesService.getAll
  });
}

export function useExpediente(id: string) {
  return useQuery({
    queryKey: ['expedientes', id],
    queryFn: () => expedientesService.getById(id),
    enabled: !!id
  });
}

export function useCreateExpediente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExpedienteData) =>
      expedientesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expedientes'] });
      toast.success('Expediente creado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear expediente');
    }
  });
}

export function useUpdateExpediente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ExpedienteData> }) =>
      expedientesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expedientes'] });
      toast.success('Expediente actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar expediente');
    }
  });
}

export function useDeleteExpediente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expedientesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expedientes'] });
      toast.success('Expediente eliminado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar expediente');
    }
  });
}

export function useCambiarEstado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CambiarEstadoData }) =>
      expedientesService.cambiarEstado(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expedientes'] });
      queryClient.invalidateQueries({ queryKey: ['historial-estados'] });
      toast.success('Estado cambiado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al cambiar estado');
    }
  });
}

export function useExpedienteDocumentos(expedienteId: string) {
  return useQuery({
    queryKey: ['expediente-documentos', expedienteId],
    queryFn: () => expedientesService.getDocumentos(expedienteId),
    enabled: !!expedienteId
  });
}

export function useMarcarDocumentoRecibido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, recibido }: { id: string; recibido: boolean }) =>
      expedientesService.marcarDocumentoRecibido(id, recibido),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expediente-documentos'] });
      toast.success('Documento actualizado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar documento');
    }
  });
}

export function useHistorialEstados(expedienteId: string) {
  return useQuery({
    queryKey: ['historial-estados', expedienteId],
    queryFn: () => expedientesService.getHistorialEstados(expedienteId),
    enabled: !!expedienteId
  });
}

export function useDeleteHistorialEstado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ historialId, expedienteId }: { historialId: string; expedienteId: string }) =>
      expedientesService.deleteHistorialEstado(historialId, expedienteId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['historial-estados', variables.expedienteId] });
      queryClient.invalidateQueries({ queryKey: ['expedientes', variables.expedienteId] });
      queryClient.invalidateQueries({ queryKey: ['expedientes'] });
      toast.success('Cambio de estado eliminado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar el cambio de estado');
    }
  });
}
