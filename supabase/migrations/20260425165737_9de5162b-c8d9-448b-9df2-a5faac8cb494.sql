-- Tabela de configurações de acesso para usuários temporários (30 min)
-- Espelha a estrutura de configuracoes_acesso (padrão)
CREATE TABLE IF NOT EXISTS public.configuracoes_acesso_temp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  login text NOT NULL DEFAULT 'rataria.io',
  senha text NOT NULL DEFAULT '2026@Rataria.io',
  totp_secret text NOT NULL DEFAULT 'UGOXHQROOAWTC6EPG4FT7WHN66RZJAQI',
  video_url text NOT NULL DEFAULT '/videos/diclaok.mp4',
  dicloak_url text NOT NULL DEFAULT 'https://dicloak.com/pt/download',
  updated_by uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.configuracoes_acesso_temp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read configuracoes_acesso_temp"
  ON public.configuracoes_acesso_temp FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert configuracoes_acesso_temp"
  ON public.configuracoes_acesso_temp FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update configuracoes_acesso_temp"
  ON public.configuracoes_acesso_temp FOR UPDATE
  TO authenticated USING (true);

-- Linha inicial para o admin editar
INSERT INTO public.configuracoes_acesso_temp DEFAULT VALUES;