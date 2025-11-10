import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  useReactTable, 
  getCoreRowModel, 
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState
} from '@tanstack/react-table';
import { Expediente, estadosConfig } from '@/types/expediente';
import { ExpedienteDialog } from '@/components/expedientes/ExpedienteDialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useExpedientes, useDeleteExpediente } from '@/hooks/useExpedientes';
import { useTiposTramite } from '@/hooks/useTiposTramite';

export default function Expedientes() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('all');
  const [tipoTramiteFilter, setTipoTramiteFilter] = useState<string>('all');

  const { data: expedientes = [], isLoading } = useExpedientes();
  const { data: tiposTramite = [] } = useTiposTramite();
  const deleteExpediente = useDeleteExpediente();

  const filteredData = useMemo(() => {
    let filtered = expedientes.map((exp: any) => ({
      ...exp,
      cliente: {
        id: exp.cliente.id,
        nombre: exp.cliente.nombre,
        apellidos: exp.cliente.apellidos || '',
        nie: exp.cliente.nie || exp.cliente.pasaporte || ''
      }
    }));

    if (estadoFilter !== 'all') {
      filtered = filtered.filter(exp => exp.estado === estadoFilter);
    }

    if (tipoTramiteFilter !== 'all') {
      filtered = filtered.filter(exp => exp.tipo_tramite.id === tipoTramiteFilter);
    }

    return filtered;
  }, [expedientes, estadoFilter, tipoTramiteFilter]);

  const columns: ColumnDef<Expediente>[] = [
    {
      accessorKey: 'numero_expediente',
      header: 'Nº Expediente',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('numero_expediente')}</div>
      )
    },
    {
      id: 'cliente',
      accessorFn: row => `${row.cliente.nombre} ${row.cliente.apellidos}`,
      header: 'Cliente',
      cell: ({ row }) => {
        const exp = row.original;
        return (
          <div>
            <div className="font-medium">{exp.cliente.nombre} {exp.cliente.apellidos}</div>
            <div className="text-sm text-muted-foreground">{exp.cliente.nie}</div>
          </div>
        );
      }
    },
    {
      accessorKey: 'tipo_tramite.nombre',
      header: 'Tipo de Trámite',
      cell: ({ row }) => {
        const exp = row.original;
        return (
          <div>
            <div>{exp.tipo_tramite.nombre}</div>
            <div className="text-sm text-muted-foreground">{exp.tipo_tramite.codigo}</div>
          </div>
        );
      }
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => {
        const estado = row.getValue('estado') as keyof typeof estadosConfig;
        const config = estadosConfig[estado];
        
        // Fallback if estado is not in estadosConfig
        if (!config) {
          return <Badge variant="outline">{estado}</Badge>;
        }
        
        // Add background colors for specific states
        const bgColorClass = estado === 'pendiente_presentar' 
          ? 'bg-yellow-500 text-black hover:bg-yellow-500/90' 
          : estado === 'requerido' 
          ? 'bg-red-600 text-white hover:bg-red-600/90' 
          : '';
        
        return <Badge variant={config.variant} className={bgColorClass}>{config.label}</Badge>;
      }
    },
    {
      accessorKey: 'fecha_inicio',
      header: 'Fecha Inicio',
      cell: ({ row }) => {
        const fecha = row.getValue('fecha_inicio') as string;
        return format(new Date(fecha), 'PP', { locale: es });
      }
    },
    {
      accessorKey: 'precio_acordado',
      header: 'Precio Acordado',
      cell: ({ row }) => {
        const precio = row.getValue('precio_acordado') as number;
        return (
          <div className="font-medium">
            {new Intl.NumberFormat('es-ES', { 
              style: 'currency', 
              currency: 'EUR' 
            }).format(precio)}
          </div>
        );
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const exp = row.original;
        return (
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(`/expedientes/${exp.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleDelete(exp.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      }
    }
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter
    }
  });

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este expediente?')) {
      deleteExpediente.mutate(id);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Expedientes</h1>
          <p className="text-muted-foreground">Gestión de expedientes y trámites</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Expediente
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtra y busca expedientes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nº expediente o cliente..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Estado Filter */}
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Object.entries(estadosConfig).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Tipo Trámite Filter */}
            <Select value={tipoTramiteFilter} onValueChange={setTipoTramiteFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {tiposTramite.map((tipo: any) => (
                  <SelectItem key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No hay expedientes registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{' '}
              de {table.getFilteredRowModel().rows.length} expedientes
            </div>
            <div className="flex gap-2">
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 por página</SelectItem>
                  <SelectItem value="20">20 por página</SelectItem>
                  <SelectItem value="50">50 por página</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <ExpedienteDialog open={showDialog} onOpenChange={setShowDialog} />
    </div>
  );
}
