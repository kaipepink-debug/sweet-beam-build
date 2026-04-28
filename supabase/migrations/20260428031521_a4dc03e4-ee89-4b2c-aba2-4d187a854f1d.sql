-- Tabela de custos para o módulo Financeiro
CREATE TABLE public.custos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  categoria TEXT NOT NULL CHECK (categoria IN ('Ferramentas', 'Anúncios', 'Equipe', 'Infraestrutura', 'Outros')),
  descricao TEXT,
  valor NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.custos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view custos"
ON public.custos FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert custos"
ON public.custos FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update custos"
ON public.custos FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete custos"
ON public.custos FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_custos_updated_at
BEFORE UPDATE ON public.custos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_custos_data ON public.custos (data DESC);
CREATE INDEX idx_custos_categoria ON public.custos (categoria);