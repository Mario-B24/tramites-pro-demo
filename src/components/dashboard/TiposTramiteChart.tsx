import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TipoTramiteStats } from '@/types/dashboard';

interface TiposTramiteChartProps {
  data: TipoTramiteStats[];
}

export function TiposTramiteChart({ data }: TiposTramiteChartProps) {
  const maxCantidad = Math.max(...data.map(d => d.cantidad), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tipos de Trámite</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{item.nombre}</span>
              <span className="text-muted-foreground">{item.cantidad}</span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-chart-1 transition-all"
                style={{
                  width: `${(item.cantidad / maxCantidad) * 100}%`
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
