
-- CPF no perfil do afiliado
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf text;

-- Tabela de compras de limite
CREATE TABLE IF NOT EXISTS public.limite_compras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  qty integer NOT NULL,
  valor_unitario numeric NOT NULL,
  valor_total numeric NOT NULL,
  payment_id text NOT NULL UNIQUE,
  qr_code text,
  copy_paste_code text,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz,
  paid_at timestamptz,
  processed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.limite_compras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own limite_compras"
ON public.limite_compras FOR SELECT TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own limite_compras"
ON public.limite_compras FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service can update limite_compras"
ON public.limite_compras FOR UPDATE TO authenticated
USING (true);

CREATE INDEX IF NOT EXISTS idx_limite_compras_user ON public.limite_compras(user_id);
CREATE INDEX IF NOT EXISTS idx_limite_compras_payment ON public.limite_compras(payment_id);

CREATE TRIGGER update_limite_compras_updated_at
BEFORE UPDATE ON public.limite_compras
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
