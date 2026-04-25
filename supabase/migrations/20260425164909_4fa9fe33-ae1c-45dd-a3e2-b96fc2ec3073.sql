-- Create table for temporary tool accesses (used by 30-min temporary subscribers)
CREATE TABLE public.acessos_temporarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ferramenta TEXT NOT NULL,
  login TEXT NOT NULL,
  senha TEXT NOT NULL,
  url_acesso TEXT,
  observacoes TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.acessos_temporarios ENABLE ROW LEVEL SECURITY;

-- Authenticated admins/team can manage; everyone (anon clients in temp panel) can read active rows
CREATE POLICY "Anyone can view active temp accesses"
  ON public.acessos_temporarios
  FOR SELECT
  USING (ativo = true);

CREATE POLICY "Authenticated users can insert temp accesses"
  ON public.acessos_temporarios
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update temp accesses"
  ON public.acessos_temporarios
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete temp accesses"
  ON public.acessos_temporarios
  FOR DELETE
  TO authenticated
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_acessos_temporarios_updated_at
  BEFORE UPDATE ON public.acessos_temporarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();