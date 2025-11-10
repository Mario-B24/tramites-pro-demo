import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface DocumentoRequerido {
  id: string;
  nombre_documento: string;
  descripcion?: string;
  obligatorio?: boolean;
  orden: number;
}

interface DocumentoExpediente {
  id: string;
  documento_requerido_id: string;
  estado_documento: string;
  fecha_recibido?: string;
  documento_requerido?: DocumentoRequerido;
}

interface DocumentosSectionProps {
  expedienteId: string;
  tipoTramiteId: string;
}

export function DocumentosSection({ expedienteId, tipoTramiteId }: DocumentosSectionProps) {
  const { toast } = useToast();
  const [documentos, setDocumentos] = useState<DocumentoExpediente[]>([]);
  const [documentosRequeridos, setDocumentosRequeridos] = useState<DocumentoRequerido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDocumentos();
  }, [expedienteId, tipoTramiteId]);

  const cargarDocumentos = async () => {
    try {
      setLoading(true);

      // Cargar documentos requeridos del tipo de trámite
      const { data: docsRequeridos, error: errorRequeridos } = await supabase
        .from('documentos_requeridos')
        .select('*')
        .eq('tipo_tramite_id', tipoTramiteId)
        .eq('active', true)
        .order('orden', { ascending: true });

      if (errorRequeridos) throw errorRequeridos;

      setDocumentosRequeridos(docsRequeridos || []);

      // Cargar documentos del expediente
      const { data: docsExpediente, error: errorExpediente } = await supabase
        .from('expediente_documentos')
        .select('*, documento_requerido:documentos_requeridos(*)')
        .eq('expediente_id', expedienteId);

      if (errorExpediente) throw errorExpediente;

      setDocumentos(docsExpediente || []);

      // Crear registros para documentos requeridos que no existen
      const docsExistentes = (docsExpediente || []).map((d: any) => d.documento_requerido_id);
      const docsFaltantes = (docsRequeridos || []).filter(dr => !docsExistentes.includes(dr.id));

      if (docsFaltantes.length > 0) {
        const nuevosRegistros = docsFaltantes.map(dr => ({
          expediente_id: expedienteId,
          documento_requerido_id: dr.id,
          estado_documento: 'pendiente'
        }));

        const { error: errorInsert } = await supabase
          .from('expediente_documentos')
          .insert(nuevosRegistros);

        if (!errorInsert) {
          cargarDocumentos(); // Recargar para mostrar los nuevos
        }
      }
    } catch (error: any) {
      console.error('Error cargando documentos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los documentos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRecibido = async (docId: string, currentEstado: string) => {
    try {
      const nuevoEstado = currentEstado === 'pendiente' ? 'recibido' : 'pendiente';
      
      const { error } = await supabase
        .from('expediente_documentos')
        .update({ 
          estado_documento: nuevoEstado,
          fecha_recibido: nuevoEstado === 'recibido' ? new Date().toISOString() : null 
        })
        .eq('id', docId);

      if (error) throw error;

      toast({
        title: 'Documento actualizado',
        description: nuevoEstado === 'recibido' 
          ? 'Documento marcado como recibido' 
          : 'Documento marcado como pendiente'
      });

      cargarDocumentos();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el documento',
        variant: 'destructive',
      });
    }
  };

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'validado':
        return 'default';
      case 'recibido':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const recibidos = documentos.filter(d => d.estado_documento === 'recibido' || d.estado_documento === 'validado').length;
  const total = documentos.length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documentos Requeridos</CardTitle>
          <CardDescription>Cargando documentos...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentos Requeridos</CardTitle>
        <CardDescription>
          {recibidos} de {total} documentos recibidos
        </CardDescription>
      </CardHeader>
      <CardContent>
        {documentos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay documentos requeridos para este tipo de trámite</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Recibido</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Recibido</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentos.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <Checkbox
                      checked={doc.estado_documento === 'recibido' || doc.estado_documento === 'validado'}
                      onCheckedChange={() => handleToggleRecibido(doc.id, doc.estado_documento)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {doc.documento_requerido?.nombre_documento || 'Sin nombre'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getEstadoBadgeVariant(doc.estado_documento)}>
                      {doc.estado_documento === 'pendiente' && 'Pendiente'}
                      {doc.estado_documento === 'recibido' && 'Recibido'}
                      {doc.estado_documento === 'validado' && 'Validado'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {doc.fecha_recibido 
                      ? format(new Date(doc.fecha_recibido), 'PP', { locale: es })
                      : '-'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
