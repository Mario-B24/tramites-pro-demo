import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tiposTramiteService, TipoTramiteData } from '@/services/tiposTramiteService';
import { documentosService } from '@/services/documentosService';
import { toast } from 'sonner';

export function useTiposTramite() {
  return useQuery({
    queryKey: ['tipos-tramite'],
    queryFn: tiposTramiteService.getAll,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

export function useTipoTramite(id: string) {
  return useQuery({
    queryKey: ['tipos-tramite', id],
    queryFn: () => tiposTramiteService.getById(id),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

export function useCreateTipoTramite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { tipo: TipoTramiteData; documentos: any[] }) => {
      console.log('=== CREAR TIPO DE TRÁMITE ===');
      console.log('Tipo:', data.tipo);
      console.log('Documentos recibidos:', data.documentos);

      // Validar datos del tipo
      if (!data.tipo.nombre || !data.tipo.codigo) {
        throw new Error('Nombre y código son obligatorios');
      }

      // Crear el tipo de trámite
      const tipo = await tiposTramiteService.create(data.tipo);
      console.log('Tipo creado:', tipo);
      
      // Guardar documentos si hay
      if (data.documentos && data.documentos.length > 0) {
        console.log('Guardando documentos...');
        
        const documentosParaGuardar = data.documentos.map((doc, index) => {
          const docData = {
            nombre_documento: doc.nombre_documento,
            descripcion: doc.descripcion || '',
            orden: doc.orden || (index + 1),
            obligatorio: doc.obligatorio ?? true,
            active: doc.active ?? true
          };
          console.log(`Documento ${index + 1}:`, docData);
          return docData;
        });

        try {
          const result = await documentosService.createBulk(tipo.id, documentosParaGuardar);
          console.log('Documentos guardados correctamente:', result);
        } catch (docError: any) {
          console.error('Error al guardar documentos:', docError);
          toast.error(`Error al guardar documentos: ${docError.message}`);
          throw docError;
        }
      } else {
        console.log('No hay documentos para guardar');
      }

      return tipo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-tramite'] });
      queryClient.invalidateQueries({ queryKey: ['documentos-requeridos'] });
      toast.success('Tipo de trámite creado correctamente');
    },
    onError: (error: any) => {
      console.error('Error completo:', error);
      toast.error(error.message || 'Error al crear tipo de trámite');
    }
  });
}

export function useUpdateTipoTramite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data, documentos }: { 
      id: string; 
      data: Partial<TipoTramiteData>;
      documentos?: any[];
    }) => {
      console.log('=== ACTUALIZAR TIPO DE TRÁMITE ===');
      console.log('ID:', id);
      console.log('Datos tipo:', data);
      console.log('Documentos:', documentos);

      // Update tipo
      const tipo = await tiposTramiteService.update(id, data);
      console.log('Tipo actualizado:', tipo);
      
      // Update documents if provided
      if (documentos && documentos.length > 0) {
        console.log('Actualizando documentos...');
        
        // Get existing documents
        const existing = await documentosService.getByTipoTramite(id);
        console.log('Documentos existentes:', existing);
        
        const existingIds = new Set(existing.map(d => d.id));
        
        // Documents to create (no id or id not in existing)
        const toCreate = documentos
          .filter(doc => !doc.id || !existingIds.has(doc.id))
          .map((doc) => ({
            tipo_tramite_id: id,
            nombre_documento: doc.nombre_documento,
            descripcion: doc.descripcion || '',
            orden: doc.orden,
            obligatorio: doc.obligatorio ?? true,
            active: doc.active ?? true
          }));
        
        // Documents to update (id exists in existing)
        const toUpdate = documentos
          .filter(doc => doc.id && existingIds.has(doc.id))
          .map(doc => ({
            id: doc.id,
            nombre_documento: doc.nombre_documento,
            descripcion: doc.descripcion || '',
            orden: doc.orden,
            obligatorio: doc.obligatorio ?? true,
            active: doc.active ?? true
          }));
        
        // Documents to delete (in existing but not in documentos)
        const docIds = new Set(documentos.filter(d => d.id).map(d => d.id));
        const toDelete = existing
          .filter(d => !docIds.has(d.id))
          .map(d => d.id);
        
        console.log('Crear:', toCreate);
        console.log('Actualizar:', toUpdate);
        console.log('Eliminar:', toDelete);
        
        // Execute operations
        try {
          if (toCreate.length > 0) {
            const created = await documentosService.createBulk(id, toCreate as any);
            console.log('Documentos creados:', created);
          }
          
          for (const doc of toUpdate) {
            const updated = await documentosService.update(doc.id, doc);
            console.log('Documento actualizado:', updated);
          }
          
          for (const docId of toDelete) {
            await documentosService.delete(docId);
            console.log('Documento eliminado:', docId);
          }
        } catch (docError: any) {
          console.error('Error al actualizar documentos:', docError);
          toast.error(`Error al actualizar documentos: ${docError.message}`);
          throw docError;
        }
      }
      
      return tipo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-tramite'] });
      queryClient.invalidateQueries({ queryKey: ['documentos-requeridos'] });
      toast.success('Tipo de trámite actualizado correctamente');
    },
    onError: (error: any) => {
      console.error('Error completo:', error);
      toast.error(error.message || 'Error al actualizar tipo de trámite');
    }
  });
}

export function useDeleteTipoTramite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tiposTramiteService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-tramite'] });
      toast.success('Tipo de trámite eliminado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar tipo de trámite');
    }
  });
}

export function useToggleActiveTipoTramite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      tiposTramiteService.toggleActive(id, active),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tipos-tramite'] });
      toast.success(`Tipo de trámite ${variables.active ? 'activado' : 'desactivado'}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al cambiar estado');
    }
  });
}
