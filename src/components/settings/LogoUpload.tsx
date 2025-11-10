import { useState } from 'react';
import { Building2, Upload, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';

interface LogoUploadProps {
  logoUrl: string | null;
  onLogoChange: (url: string | null) => void;
}

export const LogoUpload = ({ logoUrl, onLogoChange }: LogoUploadProps) => {
  const [preview, setPreview] = useState<string | null>(logoUrl);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El archivo es demasiado grande. Máximo 2MB."
      });
      return;
    }

    // Validar formato
    const validFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validFormats.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Formato no válido. Solo PNG, JPG o SVG."
      });
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onLogoChange(result);
      toast({
        title: "Logo actualizado",
        description: "El logo se ha actualizado correctamente."
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setPreview(null);
    onLogoChange(null);
    toast({
      title: "Logo eliminado",
      description: "El logo se ha eliminado correctamente."
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalización Visual</CardTitle>
        <CardDescription>Logo de Asesoría Gex (PNG, JPG, SVG - Máx 2MB)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-32 w-32 rounded-lg border-2 border-border shadow-sm">
            {preview ? (
              <AvatarImage src={preview} alt="Logo de Asesoría Gex" className="object-cover" />
            ) : (
              <AvatarFallback className="rounded-lg bg-muted">
                <Building2 className="h-12 w-12 text-muted-foreground" />
              </AvatarFallback>
            )}
          </Avatar>

          <div className="flex gap-2 flex-wrap justify-center">
            <Button variant="outline" size="sm" onClick={() => document.getElementById('logo-upload')?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Subir Logo
            </Button>
            
            {preview && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Logo
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar logo?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción eliminará el logo actual de Asesoría Gex.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRemoveLogo}>
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          <input
            id="logo-upload"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};
