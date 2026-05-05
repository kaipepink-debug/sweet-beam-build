
CREATE TABLE public.client_logins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  nome TEXT,
  plano TEXT,
  status TEXT,
  source TEXT DEFAULT 'painel',
  login_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_client_logins_email ON public.client_logins(email);
CREATE INDEX idx_client_logins_login_at ON public.client_logins(login_at DESC);

ALTER TABLE public.client_logins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view client_logins"
  ON public.client_logins FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone can insert client_logins"
  ON public.client_logins FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Authenticated can delete client_logins"
  ON public.client_logins FOR DELETE TO authenticated USING (true);
