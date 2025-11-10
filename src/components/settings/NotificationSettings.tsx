import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

interface NotificationSettingsProps {
  config: {
    notif_crear_expediente: boolean;
    notif_cambio_estado: boolean;
    notif_recordatorio_pago: boolean;
    dias_recordatorio: number;
  };
  onChange: (field: string, value: boolean | number) => void;
}

export const NotificationSettings = ({ config, onChange }: NotificationSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Notificaciones</CardTitle>
        <CardDescription>Configura las notificaciones automáticas del sistema</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notif-crear">Enviar email al crear expediente</Label>
            <p className="text-sm text-muted-foreground">
              Notificar al cliente cuando se cree un nuevo expediente
            </p>
          </div>
          <Switch
            id="notif-crear"
            checked={config.notif_crear_expediente}
            onCheckedChange={(checked) => onChange('notif_crear_expediente', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notif-estado">Enviar email al cambiar estado</Label>
            <p className="text-sm text-muted-foreground">
              Notificar al cliente cuando cambie el estado del expediente
            </p>
          </div>
          <Switch
            id="notif-estado"
            checked={config.notif_cambio_estado}
            onCheckedChange={(checked) => onChange('notif_cambio_estado', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notif-pago">Enviar recordatorios de pagos</Label>
            <p className="text-sm text-muted-foreground">
              Enviar recordatorios antes del vencimiento de pagos
            </p>
          </div>
          <Switch
            id="notif-pago"
            checked={config.notif_recordatorio_pago}
            onCheckedChange={(checked) => onChange('notif_recordatorio_pago', checked)}
          />
        </div>

        {config.notif_recordatorio_pago && (
          <div className="space-y-2">
            <Label htmlFor="dias-recordatorio">Días antes de vencimiento</Label>
            <Input
              id="dias-recordatorio"
              type="number"
              min="1"
              max="30"
              value={config.dias_recordatorio}
              onChange={(e) => onChange('dias_recordatorio', parseInt(e.target.value) || 1)}
              className="max-w-[200px]"
            />
            <p className="text-sm text-muted-foreground">
              Enviar recordatorio {config.dias_recordatorio} {config.dias_recordatorio === 1 ? 'día' : 'días'} antes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
