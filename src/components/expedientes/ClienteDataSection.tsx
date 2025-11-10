import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ClienteData {
  nombre: string;
  apellidos?: string;
  nie?: string;
  pasaporte?: string;
  nacionalidad?: string;
  fecha_nacimiento?: string;
  fecha_vencimiento_nie?: string;
  telefono?: string;
  empresa?: string;
  tipo_via?: string;
  calle?: string;
  numero?: string;
  piso?: string;
  puerta?: string;
  observaciones?: string;
}

interface ClienteDataSectionProps {
  cliente: ClienteData;
}

export function ClienteDataSection({ cliente }: ClienteDataSectionProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'PP', { locale: es });
    } catch {
      return dateString;
    }
  };

  const getDireccionCompleta = () => {
    const partes = [
      cliente.calle,
      cliente.numero ? `nº ${cliente.numero}` : null,
      cliente.piso ? `${cliente.piso}º` : null,
      cliente.puerta
    ].filter(Boolean);
    
    return partes.length > 0 ? partes.join(', ') : '-';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos del Cliente</CardTitle>
        <CardDescription>Información personal y de contacto</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Datos Personales */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-3">Datos Personales</h3>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Nombre:</span>
                  <span className="text-sm">{cliente.nombre}</span>
                </div>
                {cliente.apellidos && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm font-medium">Apellidos:</span>
                    <span className="text-sm">{cliente.apellidos}</span>
                  </div>
                )}
                {cliente.nie && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm font-medium">NIE:</span>
                    <span className="text-sm font-mono">{cliente.nie}</span>
                  </div>
                )}
                {cliente.pasaporte && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm font-medium">Pasaporte:</span>
                    <span className="text-sm font-mono">{cliente.pasaporte}</span>
                  </div>
                )}
                {cliente.nacionalidad && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm font-medium">Nacionalidad:</span>
                    <span className="text-sm">{cliente.nacionalidad}</span>
                  </div>
                )}
                {cliente.fecha_nacimiento && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm font-medium">Fecha de Nacimiento:</span>
                    <span className="text-sm">{formatDate(cliente.fecha_nacimiento)}</span>
                  </div>
                )}
                {cliente.fecha_vencimiento_nie && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm font-medium">Vencimiento NIE:</span>
                    <span className="text-sm">{formatDate(cliente.fecha_vencimiento_nie)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Datos de Contacto y Empresa */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-3">Contacto y Empresa</h3>
              <div className="space-y-2">
                {cliente.empresa && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm font-medium">Empresa:</span>
                    <span className="text-sm">{cliente.empresa}</span>
                  </div>
                )}
                {cliente.telefono && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm font-medium">Teléfono:</span>
                    <span className="text-sm">{cliente.telefono}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm font-medium">Dirección:</span>
                  <span className="text-sm text-right">{getDireccionCompleta()}</span>
                </div>
              </div>
            </div>

            {cliente.observaciones && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-3">Observaciones</h3>
                <p className="text-sm bg-muted p-3 rounded-md">{cliente.observaciones}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
