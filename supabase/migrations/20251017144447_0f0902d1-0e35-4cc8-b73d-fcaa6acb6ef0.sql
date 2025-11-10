-- Modificar tabla clients para separar NIE y Pasaporte y añadir tipo_via

-- Primero, hacemos el campo nie_pasaporte nullable (temporal)
ALTER TABLE clients ALTER COLUMN nie_pasaporte DROP NOT NULL;

-- Renombramos nie_pasaporte a nie
ALTER TABLE clients RENAME COLUMN nie_pasaporte TO nie;

-- Añadimos el nuevo campo pasaporte
ALTER TABLE clients ADD COLUMN pasaporte character varying;

-- Añadimos el campo tipo_via para la dirección
ALTER TABLE clients ADD COLUMN tipo_via character varying;

-- Comentario para claridad
COMMENT ON COLUMN clients.nie IS 'Número de Identificación de Extranjero';
COMMENT ON COLUMN clients.pasaporte IS 'Número de Pasaporte';
COMMENT ON COLUMN clients.tipo_via IS 'Tipo de vía (Avenida, Calle, Rambla, Plaza, etc.)';