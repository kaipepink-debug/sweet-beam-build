-- Permite que usuários autenticados leiam acessos ativos (não expirados)
-- para que o painel possa entregar credenciais à extensão Chrome.
-- A política original de admin (FOR ALL) continua intacta para escrita/gestão.

CREATE POLICY "Authenticated users can read active acessos"
  ON public.acessos
  FOR SELECT
  TO authenticated
  USING (data_expiracao > now());