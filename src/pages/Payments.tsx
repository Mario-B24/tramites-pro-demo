import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Eye, Edit, Trash2, Printer, ExternalLink } from 'lucide-react';
import { Payment, PaymentStatus, PaymentMethod } from '@/types/payment';
import { PaymentStats } from '@/components/payments/PaymentStats';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { toast } from 'sonner';
import { usePayments, usePendingPayments } from '@/hooks/usePayments';

const Payments = () => {
  const navigate = useNavigate();
  
  // View filter state
  const [viewFilter, setViewFilter] = useState<'registrados' | 'pendientes'>('registrados');
  
  // Date filter states
  const [dateFilter, setDateFilter] = useState<'dia' | 'semana' | 'mes' | 'personalizado'>('mes');
  const [selectedMonth, setSelectedMonth] = useState<string>(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();

  // Fetch available months with payments
  const { data: availableMonths = [] } = useQuery({
    queryKey: ['available-months'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('fecha_pago')
        .order('fecha_pago', { ascending: false });

      if (error) throw error;

      // Extract unique months and format them
      const monthsSet = new Set<string>();
      data?.forEach((payment) => {
        const date = new Date(payment.fecha_pago);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthsSet.add(monthKey);
      });

      // Convert to array and sort (most recent first)
      return Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
    }
  });

  // Calculate date range based on filter
  const getDateRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (dateFilter) {
      case 'dia': {
        return {
          inicio: today.toISOString().split('T')[0],
          fin: today.toISOString().split('T')[0]
        };
      }
      case 'semana': {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return {
          inicio: weekAgo.toISOString().split('T')[0],
          fin: today.toISOString().split('T')[0]
        };
      }
      case 'mes': {
        const [year, month] = selectedMonth.split('-').map(Number);
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0);
        return {
          inicio: startOfMonth.toISOString().split('T')[0],
          fin: endOfMonth.toISOString().split('T')[0]
        };
      }
      case 'personalizado': {
        if (customStartDate && customEndDate) {
          return {
            inicio: customStartDate.toISOString().split('T')[0],
            fin: customEndDate.toISOString().split('T')[0]
          };
        }
        return { inicio: undefined, fin: undefined };
      }
    }
  };

  const { inicio: fechaInicio, fin: fechaFin } = getDateRange();
  const { data: paymentsData = [], isLoading } = usePayments(fechaInicio, fechaFin);

  // Fetch pending expedientes using the new hook
  const { data: pendingExpedientes = [], isLoading: isPendingLoading } = usePendingPayments(fechaInicio, fechaFin);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    if (fechaInicio && fechaFin) {
      localStorage.setItem('paymentDateFilters', JSON.stringify({
        fechaInicio,
        fechaFin,
        period: dateFilter
      }));
    }
  }, [dateFilter, selectedMonth, customStartDate, customEndDate, fechaInicio, fechaFin]);
  
  // Transform Supabase data to Payment type
  const payments: Payment[] = paymentsData.map((p: any) => ({
    id: p.id,
    expediente_id: p.expediente_id,
    expediente_nombre: p.expediente?.numero_expediente || '',
    cliente_nombre: `${p.expediente?.cliente?.nombre || ''} ${p.expediente?.cliente?.apellidos || ''}`.trim() ||
      p.expediente?.cliente?.empresa || '',
    monto: p.importe,
    metodo_pago: p.metodo_pago,
    estado: 'completado' as PaymentStatus,
    fecha_pago: p.fecha_pago,
    notas: p.observaciones
  }));
  
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingSearchQuery, setPendingSearchQuery] = useState('');
  const [pendingCurrentPage, setPendingCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | undefined>();
  const [viewPayment, setViewPayment] = useState<Payment | null>(null);
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);

  // Get date range label
  const getDateRangeLabel = () => {
    switch (dateFilter) {
      case 'dia':
        return 'Hoy';
      case 'semana':
        return 'Últimos 7 días';
      case 'mes': {
        const [year, month] = selectedMonth.split('-').map(Number);
        const date = new Date(year, month - 1, 1);
        return format(date, 'MMMM yyyy', { locale: es });
      }
      case 'personalizado':
        if (customStartDate && customEndDate) {
          return `${format(customStartDate, 'dd/MM/yyyy', { locale: es })} - ${format(customEndDate, 'dd/MM/yyyy', { locale: es })}`;
        }
        return 'Selecciona fechas';
    }
  };

  // Format month for display
  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return format(date, 'MMMM yyyy', { locale: es });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };


  // Method label
  const getMethodLabel = (method: PaymentMethod) => {
    const labels: Record<PaymentMethod, string> = {
      efectivo: 'Efectivo',
      transferencia: 'Transferencia',
      tarjeta: 'Tarjeta',
      cheque: 'Cheque',
    };
    return labels[method];
  };

  // Filter and search
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch = 
        payment.cliente_nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.expediente_id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMethod = methodFilter === 'all' || payment.metodo_pago === methodFilter;
      
      return matchesSearch && matchesMethod;
    });
  }, [payments, searchQuery, methodFilter]);

  // Filter pending expedientes
  const filteredPendingExpedientes = useMemo(() => {
    return pendingExpedientes.filter((exp) => {
      const matchesSearch = 
        exp.cliente_nombre.toLowerCase().includes(pendingSearchQuery.toLowerCase()) ||
        exp.numero_expediente.toLowerCase().includes(pendingSearchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [pendingExpedientes, pendingSearchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Pagination for pending
  const totalPendingPages = Math.ceil(filteredPendingExpedientes.length / itemsPerPage);
  const paginatedPendingExpedientes = filteredPendingExpedientes.slice(
    (pendingCurrentPage - 1) * itemsPerPage,
    pendingCurrentPage * itemsPerPage
  );

  // Calculate total pending amount
  const totalPendingAmount = filteredPendingExpedientes.reduce((sum, exp) => sum + exp.pendiente, 0);

  // Handlers
  const handleSavePayment = (paymentData: Partial<Payment>) => {
    console.log('Save payment:', paymentData);
    // TODO: Implement save with mutation hooks
    toast.success(editingPayment ? 'Pago actualizado' : 'Pago registrado');
    setEditingPayment(undefined);
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    console.log('Delete payment:', id);
    // TODO: Implement delete with mutation hooks
    setDeletePaymentId(null);
    toast.success('Pago eliminado correctamente');
  };

  const handlePrintReceipt = () => {
    toast.info('Funcionalidad de impresión próximamente');
  };

  // Get progress bar color
  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return 'bg-destructive';
    if (percentage < 90) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pagos</h1>
          <p className="text-muted-foreground">
            Gestión de pagos de expedientes - {getDateRangeLabel()}
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Registrar Pago
        </Button>
      </div>

      {/* Stats Cards */}
      <PaymentStats fechaInicio={fechaInicio} fechaFin={fechaFin} />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtra los pagos por diferentes criterios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Filter */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Periodo</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={dateFilter === 'dia' ? 'default' : 'outline'}
                onClick={() => setDateFilter('dia')}
                className="flex-1 min-w-[100px]"
              >
                Hoy
              </Button>
              <Button
                variant={dateFilter === 'semana' ? 'default' : 'outline'}
                onClick={() => setDateFilter('semana')}
                className="flex-1 min-w-[140px]"
              >
                Últimos 7 días
              </Button>
              <Button
                variant={dateFilter === 'mes' ? 'default' : 'outline'}
                onClick={() => setDateFilter('mes')}
                className="flex-1 min-w-[100px]"
              >
                Por Mes
              </Button>
              <Button
                variant={dateFilter === 'personalizado' ? 'default' : 'outline'}
                onClick={() => setDateFilter('personalizado')}
                className="flex-1 min-w-[140px]"
              >
                Personalizado
              </Button>
            </div>

            {dateFilter === 'mes' && (
              <div className="space-y-2 pt-2">
                <Label>Selecciona Mes</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un mes" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {availableMonths.map((monthKey) => (
                      <SelectItem key={monthKey} value={monthKey}>
                        {formatMonthLabel(monthKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {dateFilter === 'personalizado' && (
              <div className="grid gap-4 md:grid-cols-2 pt-2">
                <div className="space-y-2">
                  <Label>Fecha Inicio</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !customStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customStartDate ? format(customStartDate, 'PPP', { locale: es }) : 'Selecciona fecha'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customStartDate}
                        onSelect={setCustomStartDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Fecha Fin</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !customEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customEndDate ? format(customEndDate, 'PPP', { locale: es }) : 'Selecciona fecha'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customEndDate}
                        onSelect={setCustomEndDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>

          {/* Search and Method Filter */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente o expediente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los métodos</SelectItem>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="transferencia">Transferencia</SelectItem>
                <SelectItem value="tarjeta">Tarjeta</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Pagos</CardTitle>
          <CardDescription>
            {viewFilter === 'registrados' 
              ? `Mostrando ${paginatedPayments.length} de ${filteredPayments.length} pagos`
              : `Mostrando ${paginatedPendingExpedientes.length} de ${filteredPendingExpedientes.length} expedientes`
            }
          </CardDescription>
          
          {/* View Filter Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant={viewFilter === 'registrados' ? 'default' : 'outline'}
              onClick={() => {
                setViewFilter('registrados');
                setCurrentPage(1);
              }}
            >
              Pagos Registrados
            </Button>
            <Button
              variant={viewFilter === 'pendientes' ? 'default' : 'outline'}
              onClick={() => {
                setViewFilter('pendientes');
                setPendingCurrentPage(1);
              }}
            >
              Pendientes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {viewFilter === 'registrados' ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Expediente</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No se encontraron pagos
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.expediente_nombre}</TableCell>
                          <TableCell>{payment.cliente_nombre}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(payment.monto)}</TableCell>
                          <TableCell>{getMethodLabel(payment.metodo_pago)}</TableCell>
                          <TableCell>{formatDate(payment.fecha_pago)}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/expedientes/${payment.expediente_id}`)}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Search for Pending */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por cliente o expediente..."
                    value={pendingSearchQuery}
                    onChange={(e) => setPendingSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Expediente</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Monto Acordado</TableHead>
                      <TableHead>Pagado</TableHead>
                      <TableHead>Pendiente</TableHead>
                      <TableHead>Progreso</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPendingExpedientes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No hay expedientes con saldo pendiente
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedPendingExpedientes.map((exp) => (
                        <TableRow key={exp.id}>
                          <TableCell className="font-medium">{exp.numero_expediente}</TableCell>
                          <TableCell>{exp.cliente_nombre}</TableCell>
                          <TableCell>{formatCurrency(exp.precio_acordado)}</TableCell>
                          <TableCell className="text-green-600">{formatCurrency(exp.pagado)}</TableCell>
                          <TableCell className="font-semibold text-destructive">
                            {formatCurrency(exp.pendiente)}
                          </TableCell>
                          <TableCell className="w-[200px]">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{exp.porcentaje.toFixed(0)}%</span>
                              </div>
                              <Progress 
                                value={exp.porcentaje} 
                                className="h-2"
                                indicatorClassName={getProgressColor(exp.porcentaje)}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/expedientes/${exp.id}`)}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination for Pending */}
              {totalPendingPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Página {pendingCurrentPage} de {totalPendingPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPendingCurrentPage(Math.max(1, pendingCurrentPage - 1))}
                      disabled={pendingCurrentPage === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPendingCurrentPage(Math.min(totalPendingPages, pendingCurrentPage + 1))}
                      disabled={pendingCurrentPage === totalPendingPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Form Dialog */}
      <PaymentForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingPayment(undefined);
        }}
        payment={editingPayment}
        onSave={handleSavePayment}
      />

      {/* View Payment Dialog */}
      <Dialog open={!!viewPayment} onOpenChange={() => setViewPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles del Pago</DialogTitle>
            <DialogDescription>Información completa del pago</DialogDescription>
          </DialogHeader>
          {viewPayment && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expediente</p>
                <p className="text-lg font-semibold">{viewPayment.expediente_id} - {viewPayment.expediente_nombre}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                <p className="text-lg">{viewPayment.cliente_nombre}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monto</p>
                  <p className="text-lg font-bold">{formatCurrency(viewPayment.monto)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Método</p>
                  <p className="text-lg">{getMethodLabel(viewPayment.metodo_pago)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                <p className="text-lg">{formatDate(viewPayment.fecha_pago)}</p>
              </div>
              {viewPayment.notas && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notas</p>
                  <p className="text-sm mt-1">{viewPayment.notas}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePaymentId} onOpenChange={() => setDeletePaymentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El pago será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePaymentId && handleDelete(deletePaymentId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Payments;
