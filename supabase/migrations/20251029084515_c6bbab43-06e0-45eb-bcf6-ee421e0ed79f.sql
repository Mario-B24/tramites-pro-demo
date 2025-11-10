-- Actualizar políticas de eliminación para permitir a operadores eliminar

-- Eliminar políticas antiguas de delete en clients
DROP POLICY IF EXISTS "Only admin can delete clients" ON public.clients;

-- Crear nueva política que permite a admin y operador eliminar clientes
CREATE POLICY "Admin and operador can delete clients"
ON public.clients
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role));

-- Eliminar políticas antiguas de delete en expedientes
DROP POLICY IF EXISTS "Only admin can delete expedientes" ON public.expedientes;

-- Crear nueva política que permite a admin y operador eliminar expedientes
CREATE POLICY "Admin and operador can delete expedientes"
ON public.expedientes
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role));

-- Eliminar políticas antiguas de delete en payments
DROP POLICY IF EXISTS "Only admin can delete payments" ON public.payments;

-- Crear nueva política que permite a admin y operador eliminar pagos
CREATE POLICY "Admin and operador can delete payments"
ON public.payments
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role));