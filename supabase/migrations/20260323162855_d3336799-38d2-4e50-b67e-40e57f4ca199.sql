
CREATE TABLE public.gmails_utilizados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gmail_id uuid NOT NULL,
  gmail_email text NOT NULL,
  ferramenta text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(gmail_id, ferramenta)
);

ALTER TABLE public.gmails_utilizados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view gmails_utilizados"
  ON public.gmails_utilizados FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert gmails_utilizados"
  ON public.gmails_utilizados FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete gmails_utilizados"
  ON public.gmails_utilizados FOR DELETE TO authenticated USING (true);
