CREATE TABLE public.afiliado_limite_historico (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  afiliado_id uuid NOT NULL,
  quantidade integer NOT NULL,
  valor_unitario numeric NOT NULL,
  valor_total numeric NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.afiliado_limite_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view limite historico"
ON public.afiliado_limite_historico
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert limite historico"
ON public.afiliado_limite_historico
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete limite historico"
ON public.afiliado_limite_historico
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_afiliado_limite_historico_afiliado ON public.afiliado_limite_historico(afiliado_id);