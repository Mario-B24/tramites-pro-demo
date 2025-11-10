import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentosService, DocumentoRequeridoData } from '@/services/documentosService';
import { toast } from 'sonner';

export function useDocumentos() {
  return useQuery({
    queryKey: ['documentos-requeridos'],
    queryFn: documentosService.getAll
  });
}

export function useDocumentosRequeridos() {
  return useQuery({
    queryKey: ['documentos-requeridos'],
    queryFn: documentosService.getAll
  });
}

export function useDocumentosByTipoTramite(tipoTramiteId: string) {
  return useQuery({
    queryKey: ['documentos-requeridos', 'tipo', tipoTramiteId],
    queryFn: () => documentosService.getByTipoTramite(tipoTramiteId),
    enabled: !!tipoTramiteId
  });
}

export function useCreateDocumento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DocumentoRequeridoData) => documentosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos-requeridos'] });
      toast.success('Documento creado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear documento');
    }
  });
}

export function useUpdateDocumento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DocumentoRequeridoData> }) =>
      documentosService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos-requeridos'] });
      toast.success('Documento actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar documento');
    }
  });
}

export function useDeleteDocumento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos-requeridos'] });
      toast.success('Documento eliminado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar documento');
    }
  });
}
