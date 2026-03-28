
ALTER TABLE public.team_permissions
  ADD COLUMN IF NOT EXISTS gerar_avisos boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS acesso_clientes boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pixels boolean NOT NULL DEFAULT false;

-- Update master user to have all new permissions enabled
UPDATE public.team_permissions
SET gerar_avisos = true, acesso_clientes = true, pixels = true
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'mandarrari@rataria.io'
);

-- Update the trigger function to include new columns for master
CREATE OR REPLACE FUNCTION public.handle_new_user_permissions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.email = 'mandarrari@rataria.io' THEN
    INSERT INTO public.team_permissions (user_id, dashboard, financeiro, vendas, assinaturas, clientes, email_acesso, ferramentas_ia, analytics, configuracoes, equipe, gerar_avisos, acesso_clientes, pixels)
    VALUES (NEW.id, true, true, true, true, true, true, true, true, true, true, true, true, true);
  ELSE
    INSERT INTO public.team_permissions (user_id) VALUES (NEW.id);
  END IF;
  RETURN NEW;
END;
$function$;
