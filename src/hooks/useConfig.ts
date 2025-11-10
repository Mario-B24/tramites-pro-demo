import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configService, ConfigData } from '@/services/configService';
import { toast } from 'sonner';

export function useConfig() {
  return useQuery({
    queryKey: ['config'],
    queryFn: configService.get
  });
}

export function useUpdateConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ConfigData>) => configService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
      toast.success('Configuración guardada correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al guardar configuración');
    }
  });
}

export function useUploadLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const logoUrl = await configService.uploadLogo(file);
      await configService.update({ logo_url: logoUrl });
      return logoUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
      toast.success('Logo actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al subir logo');
    }
  });
}

export function useDeleteLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logoUrl: string) => {
      await configService.deleteLogo(logoUrl);
      await configService.update({ logo_url: null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
      toast.success('Logo eliminado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar logo');
    }
  });
}
