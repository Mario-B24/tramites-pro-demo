import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Configuracion = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Ajusta las preferencias del sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuración General</CardTitle>
          <CardDescription>Personaliza tu experiencia</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Las opciones de configuración estarán disponibles próximamente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracion;
