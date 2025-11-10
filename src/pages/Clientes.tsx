import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ClientDialog } from '@/components/clientes/ClientDialog';
import { type Client } from '@/types/client';
import { toast } from 'sonner';
import { differenceInDays, parseISO } from 'date-fns';
import { useClients, useDeleteClient } from '@/hooks/useClients';
import { useState } from 'react';

const Clientes = () => {
  const { data: clients = [], isLoading } = useClients();
  const deleteClientMutation = useDeleteClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [nacionalidadFilter, setNacionalidadFilter] = useState<string>('all');

  const nacionalidades = useMemo(() => {
    const unique = new Set(clients.map((c) => c.nacionalidad).filter(Boolean));
    return Array.from(unique).sort();
  }, [clients]);

  const isNieExpiringSoon = (fecha?: string) => {
    if (!fecha) return false;
    const daysUntilExpiry = differenceInDays(parseISO(fecha), new Date());
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  const columns: ColumnDef<Client>[] = [
    {
      accessorFn: (row) => `${row.nombre} ${row.apellidos}`,
      id: 'nombre_completo',
      header: 'Nombre Completo',
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.nombre} {row.original.apellidos}
        </div>
      ),
    },
    {
      accessorKey: 'empresa',
      header: 'Empresa',
      cell: ({ row }) => row.original.empresa || '-',
    },
    {
      accessorKey: 'nie',
      header: 'NIE',
      cell: ({ row }) => row.original.nie || '-',
    },
    {
      accessorKey: 'pasaporte',
      header: 'Pasaporte',
      cell: ({ row }) => row.original.pasaporte || '-',
    },
    {
      accessorKey: 'telefono',
      header: 'Teléfono',
      cell: ({ row }) => row.original.telefono || '-',
    },
    {
      accessorKey: 'fecha_vencimiento_nie',
      header: 'Vencimiento NIE',
      cell: ({ row }) => {
        const fecha = row.original.fecha_vencimiento_nie;
        if (!fecha) return '-';
        
        const isExpiring = isNieExpiringSoon(fecha);
        const formattedDate = new Date(fecha).toLocaleDateString('es-ES');
        
        return (
          <div className="flex items-center gap-2">
            <span>{formattedDate}</span>
            {isExpiring && (
              <Badge variant="destructive" className="text-xs">
                Vence pronto
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleView(row.original.id)}
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(row.original)}
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row.original.id)}
            title="Eliminar"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const filteredData = useMemo(() => {
    if (nacionalidadFilter === 'all') return clients;
    return clients.filter((client) => client.nacionalidad === nacionalidadFilter);
  }, [clients, nacionalidadFilter]);

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
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handleNew = () => {
    setSelectedClient(null);
    setDialogOpen(true);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setDialogOpen(true);
  };

  const handleView = (id: string) => {
    window.location.href = `/clientes/${id}`;
  };

  const handleDelete = (id: string) => {
    deleteClientMutation.mutate(id);
  };

  const handleSave = () => {
    setDialogOpen(false);
    setSelectedClient(null);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gestiona la información de tus clientes</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            {isLoading ? 'Cargando...' : `${filteredData.length} cliente${filteredData.length !== 1 ? 's' : ''} encontrado${filteredData.length !== 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, NIE, teléfono, empresa..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={nacionalidadFilter} onValueChange={setNacionalidadFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por nacionalidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las nacionalidades</SelectItem>
                {nacionalidades.map((nacionalidad) => (
                  <SelectItem key={nacionalidad} value={nacionalidad}>
                    {nacionalidad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No se encontraron clientes.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filas por página:</span>
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={selectedClient}
        onSave={handleSave}
      />
    </div>
  );
};

export default Clientes;
