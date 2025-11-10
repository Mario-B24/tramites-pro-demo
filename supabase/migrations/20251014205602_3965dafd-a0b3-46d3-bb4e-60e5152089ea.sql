-- Add fecha_presentacion_real field to expedientes table
ALTER TABLE public.expedientes
ADD COLUMN fecha_presentacion_real date;

-- Add comment for documentation
COMMENT ON COLUMN public.expedientes.fecha_presentacion_real IS 'Fecha real en la que se presentó el expediente (ingresada manualmente al cambiar estado a presentado)';