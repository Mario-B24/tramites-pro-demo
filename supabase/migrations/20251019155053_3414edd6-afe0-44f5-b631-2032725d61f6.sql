-- Política para permitir a admin y operador eliminar entradas del historial de estados
CREATE POLICY "Admin and operador can delete historial_estados"
ON historial_estados
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'operador'::app_role));