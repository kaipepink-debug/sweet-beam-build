
-- Drop existing admin-only policies on acessos and gmails
DROP POLICY IF EXISTS "Admins can manage acessos" ON public.acessos;
DROP POLICY IF EXISTS "Admins can manage gmails" ON public.gmails;

-- Acessos: all authenticated users can read, only admins can insert/update/delete
CREATE POLICY "Authenticated users can view acessos"
  ON public.acessos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert acessos"
  ON public.acessos FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update acessos"
  ON public.acessos FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete acessos"
  ON public.acessos FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Gmails: all authenticated users can read, only admins can insert/update/delete
CREATE POLICY "Authenticated users can view gmails"
  ON public.gmails FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert gmails"
  ON public.gmails FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update gmails"
  ON public.gmails FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete gmails"
  ON public.gmails FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
