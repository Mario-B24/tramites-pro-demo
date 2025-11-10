-- Agregar columna descuento a la tabla payments
ALTER TABLE public.payments 
ADD COLUMN descuento NUMERIC(10,2) DEFAULT 0 NOT NULL;

-- Agregar comentario a la columna
COMMENT ON COLUMN public.payments.descuento IS 'Descuento aplicado al expediente con este pago';