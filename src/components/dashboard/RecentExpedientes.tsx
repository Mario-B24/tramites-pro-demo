import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExpedienteReciente } from '@/types/dashboard';
import { estadosConfig } from '@/types/expediente';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface RecentExpedientesProps {
  data: ExpedienteReciente[];
}

export function RecentExpedientes({ data }: RecentExpedientesProps) {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Expedientes Pendientes de Atención</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate('/expedientes')}>
          Ver Todos
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Trámite</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((expediente) => (
              <TableRow 
                key={expediente.id}
                className="cursor-pointer"
                onClick={() => navigate(`/expedientes/${expediente.id}`)}
              >
                <TableCell className="font-medium">{expediente.numero}</TableCell>
                <TableCell>{expediente.cliente}</TableCell>
                <TableCell>{expediente.tramite}</TableCell>
                <TableCell>
                  {(() => {
                    const config = estadosConfig[expediente.estado as keyof typeof estadosConfig];
                    const bgColorClass = expediente.estado === 'pendiente_presentar' 
                      ? 'bg-yellow-500 text-black hover:bg-yellow-500/90' 
                      : expediente.estado === 'requerido' 
                      ? 'bg-red-600 text-white hover:bg-red-600/90' 
                      : '';
                    
                    return (
                      <Badge variant={config?.variant || 'outline'} className={bgColorClass}>
                        {config?.label || expediente.estado}
                      </Badge>
                    );
                  })()}
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(expediente.fecha)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
