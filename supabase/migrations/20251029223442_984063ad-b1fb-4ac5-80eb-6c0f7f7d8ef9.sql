-- Restrict DELETE on expedientes to admin only
DROP POLICY IF EXISTS "Admin and operador can delete expedientes" ON public.expedientes;

CREATE POLICY "Only admin can delete expedientes"
ON public.expedientes
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));