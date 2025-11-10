-- Fix Critical Security Issues: Restrict DELETE operations to appropriate roles

-- 1. Fix clients table - Only admin can delete (contains PII)
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar clientes" ON public.clients;

CREATE POLICY "Only admin can delete clients"
ON public.clients
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Fix payments table - Only admin can delete (financial records)
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar pagos" ON public.payments;

CREATE POLICY "Only admin can delete payments"
ON public.payments
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Fix expedientes table - Admin and operador can delete (business records)
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar expedientes" ON public.expedientes;

CREATE POLICY "Admin and operador can delete expedientes"
ON public.expedientes
FOR DELETE
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'operador'::app_role)
);

-- 4. Fix tipos_tramite table - Complete lockdown, only admin can manage
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer tipos_tramite" ON public.tipos_tramite;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear tipos_tramite" ON public.tipos_tramite;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar tipos_tramite" ON public.tipos_tramite;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar tipos_tramite" ON public.tipos_tramite;

-- Allow admin and operador to read (needed for dropdowns)
CREATE POLICY "Admin and operador can read tipos_tramite"
ON public.tipos_tramite
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'operador'::app_role)
);

-- Only admin can create, update, or delete
CREATE POLICY "Only admin can manage tipos_tramite"
ON public.tipos_tramite
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));