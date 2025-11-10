-- Añadir columna numero_pago a la tabla payments
ALTER TABLE public.payments
ADD COLUMN numero_pago TEXT;