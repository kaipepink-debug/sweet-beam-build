-- Tabela proxies pra gerenciar IPs/credenciais dos proxies pela tela de admin.
-- A extensão Chrome puxa o proxy ativo via sync e aplica via chrome.proxy.

CREATE TABLE IF NOT EXISTS public.proxies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label text NULL,
  protocol text NOT NULL DEFAULT 'http'
    CHECK (protocol IN ('http', 'https', 'socks5')),
  host text NOT NULL,
  port integer NOT NULL CHECK (port > 0 AND port <= 65535),
  username text NULL,
  password text NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.proxies ENABLE ROW LEVEL SECURITY;

-- Admins fazem CRUD completo
CREATE POLICY "Admins can manage proxies"
  ON public.proxies FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Usuários autenticados leem só os ativos (pra extensão)
CREATE POLICY "Authenticated users can read active proxies"
  ON public.proxies FOR SELECT
  TO authenticated
  USING (ativo = true);

CREATE TRIGGER update_proxies_updated_at
  BEFORE UPDATE ON public.proxies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.proxies IS
  'Pool de proxies pra rotear tráfego das ferramentas via extensão Chrome';
COMMENT ON COLUMN public.proxies.label IS
  'Nome amigável (ex: "BR-SP-1", "Webshare Datacenter")';
