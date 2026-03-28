
CREATE TABLE public.pixels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  pixel_id text NOT NULL DEFAULT '',
  api_token text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.pixels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view pixels" ON public.pixels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert pixels" ON public.pixels FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update pixels" ON public.pixels FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete pixels" ON public.pixels FOR DELETE TO authenticated USING (true);

-- Seed default rows
INSERT INTO public.pixels (platform, pixel_id, api_token) VALUES ('facebook', '', '');
INSERT INTO public.pixels (platform, pixel_id, api_token) VALUES ('tiktok', '', '');
