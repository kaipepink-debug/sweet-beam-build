CREATE OR REPLACE FUNCTION public.handle_new_user_permissions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.email = 'mandarrari@rataria.io' THEN
    INSERT INTO public.team_permissions (user_id, dashboard, financeiro, vendas, assinaturas, clientes, email_acesso, ferramentas_ia, analytics, configuracoes, equipe, gerar_avisos, acesso_clientes, pixels)
    VALUES (NEW.id, true, true, true, true, true, true, true, true, true, true, true, true, true)
    ON CONFLICT (user_id) DO NOTHING;
  ELSIF COALESCE(NEW.raw_user_meta_data->>'is_afiliado', 'false') = 'true' THEN
    INSERT INTO public.team_permissions (user_id, is_afiliado, assinaturas, verificacao_login, max_assinaturas)
    VALUES (NEW.id, true, true, true, 0)
    ON CONFLICT (user_id) DO UPDATE SET is_afiliado = true, assinaturas = true, verificacao_login = true, max_assinaturas = 0;
  ELSE
    INSERT INTO public.team_permissions (user_id) VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;