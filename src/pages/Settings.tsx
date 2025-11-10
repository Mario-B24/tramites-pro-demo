import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { LogoUpload } from '@/components/settings/LogoUpload';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { PaymentSettings } from '@/components/settings/PaymentSettings';
import { GestoriaConfig } from '@/types/config';
import { RotateCcw, Save, ShieldAlert } from 'lucide-react';
import { useConfig } from '@/hooks/useConfig';

const Settings = () => {
  // Simulación de verificación de admin
  const userRole = 'admin'; // En producción, esto vendría de auth/context

  const { data: configData, isLoading } = useConfig();
  const [config, setConfig] = useState<GestoriaConfig | null>(null);
  const [originalConfig, setOriginalConfig] = useState<GestoriaConfig | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize config from API data
  useEffect(() => {
    if (configData && !config) {
      setConfig(configData as GestoriaConfig);
      setOriginalConfig(configData as GestoriaConfig);
    }
  }, [configData, config]);

  // Verificar si hay cambios
  useEffect(() => {
    if (config && originalConfig) {
      const changed = JSON.stringify(config) !== JSON.stringify(originalConfig);
      setHasChanges(changed);
    }
  }, [config, originalConfig]);

  // Si no es admin, mostrar mensaje de error
  if (userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="p-8 max-w-md">
          <div className="flex flex-col items-center text-center space-y-4">
            <ShieldAlert className="h-16 w-16 text-destructive" />
            <h2 className="text-2xl font-bold">Acceso Restringido</h2>
            <p className="text-muted-foreground">
              No tienes permisos para acceder a esta página. Esta sección es solo para administradores.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const handleInputChange = (field: keyof GestoriaConfig, value: string | boolean | number) => {
    if (!config) return;
    setConfig({ ...config, [field]: value } as GestoriaConfig);
  };

  const validateForm = (): boolean => {
    if (!config || !config.nombre_gestoria || config.nombre_gestoria.length < 3) {
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "El nombre de la asesoría debe tener al menos 3 caracteres."
      });
      return false;
    }

    if (config.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email)) {
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "El email no tiene un formato válido."
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || !config) return;

    setIsSaving(true);
    
    // TODO: Implement save with mutation hooks
    setTimeout(() => {
      setOriginalConfig(config);
      setIsSaving(false);
      toast({
        title: "Configuración guardada",
        description: "Los cambios se han guardado correctamente."
      });
    }, 1000);
  };

  const handleReset = () => {
    if (originalConfig) {
      setConfig(originalConfig);
      toast({
        title: "Configuración restaurada",
        description: "Se han cancelado los cambios."
      });
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Configuración</h1>
            {hasChanges && (
              <Badge variant="secondary" className="animate-pulse">
                Cambios pendientes
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">Configuración general de Asesoría Gex</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Información de la Asesoría */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Asesoría</CardTitle>
            <CardDescription>Datos generales de Asesoría Gex</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la asesoría *</Label>
                <Input
                  id="nombre"
                  value={config?.nombre_gestoria || ''}
                  onChange={(e) => handleInputChange('nombre_gestoria', e.target.value)}
                  placeholder="Asesoría Gex"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={config?.telefono || ''}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  placeholder="+34 912 345 678"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email de contacto</Label>
                <Input
                  id="email"
                  type="email"
                  value={config?.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contacto@gestoria.com"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Textarea
                  id="direccion"
                  value={config?.direccion || ''}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  placeholder="Calle Principal, 123"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logo */}
        {config && (
          <LogoUpload
            logoUrl={config.logo_url || ''}
            onLogoChange={(url) => handleInputChange('logo_url', url || '')}
          />
        )}

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar valores por defecto
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Restaurar configuración?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción restaurará todos los valores a la configuración por defecto.
                  Los cambios no guardados se perderán.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>
                  Restaurar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || isSaving}
            className="min-w-[150px]"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
