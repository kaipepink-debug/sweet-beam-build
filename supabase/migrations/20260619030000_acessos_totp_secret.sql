-- Adiciona coluna totp_secret pra armazenar o seed Base32 do 2FA (RFC 6238)
-- por linha de acesso. NULL = ferramenta não tem 2FA.
-- A geração do código de 6 dígitos fica na extensão (popup gera via WebCrypto).

ALTER TABLE public.acessos
  ADD COLUMN IF NOT EXISTS totp_secret text NULL;

COMMENT ON COLUMN public.acessos.totp_secret IS
  'Seed Base32 do TOTP (Google Authenticator/Authy) — opcional. Geração do código rotativo de 6 dígitos é feita client-side pela extensão.';
