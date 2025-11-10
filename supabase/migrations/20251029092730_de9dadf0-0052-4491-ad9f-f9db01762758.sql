-- Permitir a usuarios autenticados eliminar registros (opción simple)

-- 1. Actualizar políticas de clients
DROP POLICY IF EXISTS "Admin and operador can delete clients" ON public.clients;

CREATE POLICY "Usuarios autenticados pueden eliminar clientes"
ON public.clients
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- 2. Actualizar políticas de expedientes
DROP POLICY IF EXISTS "Admin and operador can delete expedientes" ON public.expedientes;

CREATE POLICY "Usuarios autenticados pueden eliminar expedientes"
ON public.expedientes
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- 3. Actualizar políticas de payments
DROP POLICY IF EXISTS "Admin and operador can delete payments" ON public.payments;

CREATE POLICY "Usuarios autenticados pueden eliminar pagos"
ON public.payments
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- 4. Actualizar políticas de expediente_documentos
DROP POLICY IF EXISTS "Admin and operador can delete expediente_documentos" ON public.expediente_documentos;

CREATE POLICY "Usuarios autenticados pueden eliminar expediente_documentos"
ON public.expediente_documentos
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- 5. Actualizar políticas de historial_estados
DROP POLICY IF EXISTS "Admin and operador can delete historial_estados" ON public.historial_estados;

CREATE POLICY "Usuarios autenticados pueden eliminar historial_estados"
ON public.historial_estados
FOR DELETE
USING (auth.uid() IS NOT NULL);