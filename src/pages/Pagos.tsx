import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Pagos = () => {
  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pagos</h1>
          <p className="text-muted-foreground">Administra los pagos de tus clientes</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Registrar Pago
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Pagos</CardTitle>
          <CardDescription>No hay pagos registrados aún</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Los pagos registrados aparecerán aquí.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pagos;
