-- Fix operator deletion and tighten security per reported issues

-- 1) Allow operador to delete expediente_documentos (needed when deleting expedientes)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'expediente_documentos' AND policyname = 'Only admin can delete expediente_documentos'
  ) THEN
    EXECUTE 'DROP POLICY "Only admin can delete expediente_documentos" ON public.expediente_documentos';
  END IF;
END $$;

CREATE POLICY "Admin and operador can delete expediente_documentos"
ON public.expediente_documentos
FOR DELETE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operador'));


-- 2) Tighten RLS on documentos_requeridos: only admin can mutate
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'documentos_requeridos' AND policyname = 'Usuarios autenticados pueden crear documentos_requeridos'
  ) THEN
    EXECUTE 'DROP POLICY "Usuarios autenticados pueden crear documentos_requeridos" ON public.documentos_requeridos';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'documentos_requeridos' AND policyname = 'Usuarios autenticados pueden actualizar documentos_requeridos'
  ) THEN
    EXECUTE 'DROP POLICY "Usuarios autenticados pueden actualizar documentos_requeridos" ON public.documentos_requeridos';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'documentos_requeridos' AND policyname = 'Usuarios autenticados pueden eliminar documentos_requeridos'
  ) THEN
    EXECUTE 'DROP POLICY "Usuarios autenticados pueden eliminar documentos_requeridos" ON public.documentos_requeridos';
  END IF;
END $$;

CREATE POLICY "Only admin can create documentos_requeridos"
ON public.documentos_requeridos
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admin can update documentos_requeridos"
ON public.documentos_requeridos
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admin can delete documentos_requeridos"
ON public.documentos_requeridos
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Keep SELECT policy as-is (authenticated read), but ensure RLS is enabled (safety)
ALTER TABLE public.documentos_requeridos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expediente_documentos ENABLE ROW LEVEL SECURITY;