
CREATE TABLE public.acessos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ferramenta text NOT NULL DEFAULT 'grok',
  email_cliente text NOT NULL,
  login text NOT NULL,
  senha text NOT NULL,
  data_criacao timestamp with time zone NOT NULL DEFAULT now(),
  data_expiracao timestamp with time zone NOT NULL,
  video_url text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.acessos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage acessos" ON public.acessos
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_acessos_updated_at
  BEFORE UPDATE ON public.acessos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
