import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { DocumentoDialog } from '@/components/documentos/DocumentoDialog';
import { DocumentoRequerido } from '@/types/tramite';
import { toast } from 'sonner';
import { useDocumentos, useDeleteDocumento } from '@/hooks/useDocumentos';
import { useTiposTramite } from '@/hooks/useTiposTramite';

const DocumentosRequeridos = () => {
  const [searchParams] = useSearchParams();
  const tipoParam = searchParams.get('tipo');

  const { data: documentos = [], isLoading } = useDocumentos();
  const { data: tiposTramite = [] } = useTiposTramite();
  const deleteMutation = useDeleteDocumento();
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>(tipoParam || 'all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentoRequerido | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; doc: DocumentoRequerido | null }>({
    open: false,
    doc: null,
  });

  // Update filter when URL param changes
  useEffect(() => {
    if (tipoParam) {
      setTipoFilter(tipoParam);
    }
  }, [tipoParam]);

  // Filter documentos
  const filteredDocumentos = (documentos as any[]).filter((doc) => {
    const matchesActive = !showOnlyActive || doc.active;
    const matchesTipo = tipoFilter === 'all' || doc.tipo_tramite_id === tipoFilter;
    const matchesSearch =
      searchQuery === '' ||
      doc.nombre_documento.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.descripcion || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesActive && matchesTipo && matchesSearch;
  });

  const handleCreateEdit = () => {
    setSelectedDoc(null);
    setDialogOpen(true);
  };

  const handleEdit = (doc: DocumentoRequerido) => {
    setSelectedDoc(doc);
    setDialogOpen(true);
  };

  const handleSave = (data: any) => {
    console.log('Save documento:', data);
    // TODO: Implement save with mutation hooks
    toast.success(selectedDoc ? 'Documento actualizado' : 'Documento creado');
    setDialogOpen(false);
  };

  const handleDelete = (doc: DocumentoRequerido) => {
    setDeleteDialog({ open: true, doc });
  };

  const confirmDelete = () => {
    if (!deleteDialog.doc) return;
    
    deleteMutation.mutate(deleteDialog.doc.id);
    setDeleteDialog({ open: false, doc: null });
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getTipoColor = (tipoId: string) => {
    const colors = ['default', 'secondary', 'outline'];
    const index = parseInt(tipoId) % colors.length;
    return colors[index] as 'default' | 'secondary' | 'outline';
  };

  const getTipoNombre = (tipoId: string) => {
    const tipo = tiposTramite.find((t: any) => t.id === tipoId);
    return tipo?.nombre || 'Sin tipo';
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Documentos Requeridos</h1>
          <p className="text-muted-foreground">Gestiona los documentos necesarios por trámite</p>
        </div>
        <Button onClick={handleCreateEdit}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Documento
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Label className="text-sm mb-2">Tipo de Trámite</Label>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {tiposTramite
                  .filter((t: any) => t.active)
                  .map((tipo: any) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-1">
            <Label className="text-sm mb-2">Búsqueda</Label>
            <Input
              placeholder="Buscar por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="md:col-span-1 flex items-end">
            <div className="flex items-center gap-2">
              <Switch
                id="active-filter"
                checked={showOnlyActive}
                onCheckedChange={setShowOnlyActive}
              />
              <Label htmlFor="active-filter" className="cursor-pointer">
                Solo Activos
              </Label>
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo de Trámite</TableHead>
              <TableHead>Nombre del Documento</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Orden</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocumentos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No se encontraron documentos requeridos
                </TableCell>
              </TableRow>
            ) : (
              filteredDocumentos.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <Badge variant={getTipoColor(doc.tipo_tramite_id)}>
                      {getTipoNombre(doc.tipo_tramite_id)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{doc.nombre_documento}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {truncateText(doc.descripcion)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{doc.orden}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={doc.active ? 'default' : 'outline'}>
                      {doc.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(doc)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Dialogs */}
      <DocumentoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        documento={selectedDoc}
        onSave={handleSave}
        defaultTipoTramiteId={tipoFilter !== 'all' ? tipoFilter : undefined}
      />

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, doc: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el documento
              "{deleteDialog.doc?.nombre_documento}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DocumentosRequeridos;
