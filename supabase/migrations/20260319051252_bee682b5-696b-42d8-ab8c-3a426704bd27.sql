CREATE OR REPLACE FUNCTION public.handle_new_user_permissions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.email = 'mandarrari@rataria.io' THEN
    INSERT INTO public.team_permissions (user_id, dashboard, financeiro, vendas, assinaturas, clientes, email_acesso, ferramentas_ia, analytics, configuracoes, equipe)
    VALUES (NEW.id, true, true, true, true, true, true, true, true, true, true);
  ELSE
    INSERT INTO public.team_permissions (user_id) VALUES (NEW.id);
  END IF;
  RETURN NEW;
END;
$function$;