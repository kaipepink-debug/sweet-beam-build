CREATE TABLE public.receitas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  origem TEXT NOT NULL,
  descricao TEXT,
  valor NUMERIC NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.receitas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view receitas" ON public.receitas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert receitas" ON public.receitas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update receitas" ON public.receitas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete receitas" ON public.receitas FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_receitas_updated_at
BEFORE UPDATE ON public.receitas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();