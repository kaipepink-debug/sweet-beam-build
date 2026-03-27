
CREATE TABLE public.configuracoes_acesso (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  login text NOT NULL DEFAULT 'rataria.io',
  senha text NOT NULL DEFAULT '2026@Rataria.io',
  totp_secret text NOT NULL DEFAULT 'UGOXHQROOAWTC6EPG4FT7WHN66RZJAQI',
  updated_by uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.configuracoes_acesso ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read configuracoes_acesso" ON public.configuracoes_acesso
  FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can update configuracoes_acesso" ON public.configuracoes_acesso
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert configuracoes_acesso" ON public.configuracoes_acesso
  FOR INSERT TO authenticated WITH CHECK (true);

INSERT INTO public.configuracoes_acesso (login, senha, totp_secret) VALUES ('rataria.io', '2026@Rataria.io', 'UGOXHQROOAWTC6EPG4FT7WHN66RZJAQI');
