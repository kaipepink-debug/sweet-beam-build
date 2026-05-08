CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$function$;

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
  ELSIF COALESCE(NEW.raw_user_meta_data->>'is_afiliado', 'false') = 'true' THEN
    INSERT INTO public.team_permissions (user_id, is_afiliado, assinaturas, verificacao_login, max_assinaturas)
    VALUES (NEW.id, true, true, true, 5);
  ELSE
    INSERT INTO public.team_permissions (user_id) VALUES (NEW.id);
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_perms ON auth.users;

CREATE TRIGGER on_auth_user_created_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_created_role
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

CREATE TRIGGER on_auth_user_created_perms
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_permissions();