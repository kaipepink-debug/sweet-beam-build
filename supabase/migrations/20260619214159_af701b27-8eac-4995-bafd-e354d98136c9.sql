ALTER TABLE public.acessos
  ADD COLUMN IF NOT EXISTS totp_secret text NULL;

COMMENT ON COLUMN public.acessos.totp_secret IS
  'Seed Base32 do TOTP (Google Authenticator/Authy) — opcional. Geração do código rotativo de 6 dígitos é feita client-side pela extensão.';