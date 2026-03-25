
CREATE TABLE public.ferramentas_fornecedor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ferramenta text NOT NULL UNIQUE,
  url text NOT NULL DEFAULT '',
  updated_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ferramentas_fornecedor ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view ferramentas_fornecedor"
ON public.ferramentas_fornecedor FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert ferramentas_fornecedor"
ON public.ferramentas_fornecedor FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update ferramentas_fornecedor"
ON public.ferramentas_fornecedor FOR UPDATE TO authenticated USING (true);
