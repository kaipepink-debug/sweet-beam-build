
-- Drop admin-only write policies on acessos
DROP POLICY IF EXISTS "Admins can insert acessos" ON public.acessos;
DROP POLICY IF EXISTS "Admins can update acessos" ON public.acessos;
DROP POLICY IF EXISTS "Admins can delete acessos" ON public.acessos;

-- Drop admin-only write policies on gmails
DROP POLICY IF EXISTS "Admins can insert gmails" ON public.gmails;
DROP POLICY IF EXISTS "Admins can update gmails" ON public.gmails;
DROP POLICY IF EXISTS "Admins can delete gmails" ON public.gmails;

-- Acessos: all authenticated users can CRUD
CREATE POLICY "Authenticated users can insert acessos"
  ON public.acessos FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update acessos"
  ON public.acessos FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete acessos"
  ON public.acessos FOR DELETE TO authenticated
  USING (true);

-- Gmails: all authenticated users can CRUD
CREATE POLICY "Authenticated users can insert gmails"
  ON public.gmails FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update gmails"
  ON public.gmails FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete gmails"
  ON public.gmails FOR DELETE TO authenticated
  USING (true);
