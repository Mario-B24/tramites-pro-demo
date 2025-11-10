-- Make deletions cascade through related tables so removing a client deletes dependent rows
BEGIN;

-- 1) payments.cliente_id -> clients.id (explicit name from error)
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_cliente_id_fkey;
ALTER TABLE public.payments
  ADD CONSTRAINT payments_cliente_id_fkey
  FOREIGN KEY (cliente_id)
  REFERENCES public.clients(id)
  ON DELETE CASCADE;

-- 2) expedientes.cliente_id -> clients.id
-- Try common name first, then fallback to dynamic drop
ALTER TABLE public.expedientes DROP CONSTRAINT IF EXISTS expedientes_cliente_id_fkey;
DO $$
DECLARE conname text;
BEGIN
  SELECT c.conname INTO conname
  FROM pg_constraint c
  JOIN pg_class r ON r.oid = c.conrelid
  JOIN pg_namespace n ON n.oid = r.relnamespace
  WHERE n.nspname = 'public'
    AND r.relname = 'expedientes'
    AND c.contype = 'f'
    AND EXISTS (
      SELECT 1 FROM pg_attribute a
      WHERE a.attrelid = c.conrelid
        AND a.attnum = ANY(c.conkey)
        AND a.attname = 'cliente_id'
    );
  IF conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.expedientes DROP CONSTRAINT %I', conname);
  END IF;
END $$;
ALTER TABLE public.expedientes
  ADD CONSTRAINT expedientes_cliente_id_fkey
  FOREIGN KEY (cliente_id)
  REFERENCES public.clients(id)
  ON DELETE CASCADE;

-- 3) payments.expediente_id -> expedientes.id
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_expediente_id_fkey;
DO $$
DECLARE conname text;
BEGIN
  SELECT c.conname INTO conname
  FROM pg_constraint c
  JOIN pg_class r ON r.oid = c.conrelid
  JOIN pg_namespace n ON n.oid = r.relnamespace
  WHERE n.nspname = 'public'
    AND r.relname = 'payments'
    AND c.contype = 'f'
    AND EXISTS (
      SELECT 1 FROM pg_attribute a
      WHERE a.attrelid = c.conrelid
        AND a.attnum = ANY(c.conkey)
        AND a.attname = 'expediente_id'
    );
  IF conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.payments DROP CONSTRAINT %I', conname);
  END IF;
END $$;
ALTER TABLE public.payments
  ADD CONSTRAINT payments_expediente_id_fkey
  FOREIGN KEY (expediente_id)
  REFERENCES public.expedientes(id)
  ON DELETE CASCADE;

-- 4) expediente_documentos.expediente_id -> expedientes.id
ALTER TABLE public.expediente_documentos DROP CONSTRAINT IF EXISTS expediente_documentos_expediente_id_fkey;
DO $$
DECLARE conname text;
BEGIN
  SELECT c.conname INTO conname
  FROM pg_constraint c
  JOIN pg_class r ON r.oid = c.conrelid
  JOIN pg_namespace n ON n.oid = r.relnamespace
  WHERE n.nspname = 'public'
    AND r.relname = 'expediente_documentos'
    AND c.contype = 'f'
    AND EXISTS (
      SELECT 1 FROM pg_attribute a
      WHERE a.attrelid = c.conrelid
        AND a.attnum = ANY(c.conkey)
        AND a.attname = 'expediente_id'
    );
  IF conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.expediente_documentos DROP CONSTRAINT %I', conname);
  END IF;
END $$;
ALTER TABLE public.expediente_documentos
  ADD CONSTRAINT expediente_documentos_expediente_id_fkey
  FOREIGN KEY (expediente_id)
  REFERENCES public.expedientes(id)
  ON DELETE CASCADE;

-- 5) historial_estados.expediente_id -> expedientes.id
ALTER TABLE public.historial_estados DROP CONSTRAINT IF EXISTS historial_estados_expediente_id_fkey;
DO $$
DECLARE conname text;
BEGIN
  SELECT c.conname INTO conname
  FROM pg_constraint c
  JOIN pg_class r ON r.oid = c.conrelid
  JOIN pg_namespace n ON n.oid = r.relnamespace
  WHERE n.nspname = 'public'
    AND r.relname = 'historial_estados'
    AND c.contype = 'f'
    AND EXISTS (
      SELECT 1 FROM pg_attribute a
      WHERE a.attrelid = c.conrelid
        AND a.attnum = ANY(c.conkey)
        AND a.attname = 'expediente_id'
    );
  IF conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.historial_estados DROP CONSTRAINT %I', conname);
  END IF;
END $$;
ALTER TABLE public.historial_estados
  ADD CONSTRAINT historial_estados_expediente_id_fkey
  FOREIGN KEY (expediente_id)
  REFERENCES public.expedientes(id)
  ON DELETE CASCADE;

COMMIT;