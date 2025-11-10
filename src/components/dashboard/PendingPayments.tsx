import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PagoPendiente } from '@/types/dashboard';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle } from 'lucide-react';

interface PendingPaymentsProps {
  data: PagoPendiente[];
}

export function PendingPayments({ data }: PendingPaymentsProps) {
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pagos Pendientes</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate('/pagos')}>
          Ver Todos
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((pago) => (
            <div 
              key={pago.id} 
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => navigate('/pagos')}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{pago.cliente}</p>
                  {pago.vencido && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Vencido
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{pago.expediente}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(pago.monto)}</p>
                <p className="text-xs text-muted-foreground">Vence: {formatDate(pago.fechaVencimiento)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
