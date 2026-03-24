
CREATE TABLE public.assinantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL,
  produto text NOT NULL DEFAULT 'RatarIA',
  plano text DEFAULT 'N/A',
  status text NOT NULL DEFAULT 'Ativa',
  valor numeric(10,2) NOT NULL DEFAULT 0,
  meio_pagamento text DEFAULT 'N/A',
  proxima_cobranca date,
  data_criacao date NOT NULL DEFAULT CURRENT_DATE,
  data_renovacao date,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assinantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view assinantes"
  ON public.assinantes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert assinantes"
  ON public.assinantes FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update assinantes"
  ON public.assinantes FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete assinantes"
  ON public.assinantes FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_assinantes_updated_at
  BEFORE UPDATE ON public.assinantes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
