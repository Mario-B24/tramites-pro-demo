-- Agregar columna observaciones a historial_estados
ALTER TABLE historial_estados ADD COLUMN IF NOT EXISTS observaciones TEXT;