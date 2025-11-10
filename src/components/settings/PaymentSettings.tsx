import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PaymentSettingsProps {
  config: {
    moneda: 'MXN' | 'USD' | 'EUR';
    permitir_pagos_parciales: boolean;
    generar_recibos_auto: boolean;
  };
  onChange: (field: string, value: string | boolean) => void;
}

export const PaymentSettings = ({ config, onChange }: PaymentSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Pagos</CardTitle>
        <CardDescription>Configura las opciones de gestión de pagos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="moneda">Moneda predeterminada</Label>
          <Select value={config.moneda} onValueChange={(value) => onChange('moneda', value)}>
            <SelectTrigger id="moneda" className="max-w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MXN">Peso Mexicano (MXN)</SelectItem>
              <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
              <SelectItem value="EUR">Euro (EUR)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Moneda utilizada por defecto en expedientes y pagos
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="pagos-parciales">Permitir pagos parciales</Label>
            <p className="text-sm text-muted-foreground">
              Los clientes pueden realizar pagos en varias exhibiciones
            </p>
          </div>
          <Switch
            id="pagos-parciales"
            checked={config.permitir_pagos_parciales}
            onCheckedChange={(checked) => onChange('permitir_pagos_parciales', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="recibos-auto">Generar recibos automáticos</Label>
            <p className="text-sm text-muted-foreground">
              Crear recibos automáticamente al registrar un pago
            </p>
          </div>
          <Switch
            id="recibos-auto"
            checked={config.generar_recibos_auto}
            onCheckedChange={(checked) => onChange('generar_recibos_auto', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
