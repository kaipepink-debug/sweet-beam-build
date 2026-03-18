
-- Table to store which dashboard features each user can access
CREATE TABLE public.team_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  dashboard BOOLEAN NOT NULL DEFAULT false,
  financeiro BOOLEAN NOT NULL DEFAULT false,
  vendas BOOLEAN NOT NULL DEFAULT false,
  assinaturas BOOLEAN NOT NULL DEFAULT false,
  clientes BOOLEAN NOT NULL DEFAULT false,
  ferramentas_ia BOOLEAN NOT NULL DEFAULT true,
  analytics BOOLEAN NOT NULL DEFAULT false,
  configuracoes BOOLEAN NOT NULL DEFAULT false,
  equipe BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.team_permissions ENABLE ROW LEVEL SECURITY;

-- Users can read their own permissions
CREATE POLICY "Users can view own permissions" ON public.team_permissions
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can manage all permissions
CREATE POLICY "Admins can manage permissions" ON public.team_permissions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_team_permissions_updated_at
  BEFORE UPDATE ON public.team_permissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create permissions for new users (admin gets all true)
CREATE OR REPLACE FUNCTION public.handle_new_user_permissions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'mandarrari@rataria.io' THEN
    INSERT INTO public.team_permissions (user_id, dashboard, financeiro, vendas, assinaturas, clientes, ferramentas_ia, analytics, configuracoes, equipe)
    VALUES (NEW.id, true, true, true, true, true, true, true, true, true);
  ELSE
    INSERT INTO public.team_permissions (user_id) VALUES (NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_permissions
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_permissions();

-- Insert permissions for existing admin user
INSERT INTO public.team_permissions (user_id, dashboard, financeiro, vendas, assinaturas, clientes, ferramentas_ia, analytics, configuracoes, equipe)
SELECT id, true, true, true, true, true, true, true, true, true
FROM auth.users WHERE email = 'mandarrari@rataria.io'
ON CONFLICT (user_id) DO NOTHING;
