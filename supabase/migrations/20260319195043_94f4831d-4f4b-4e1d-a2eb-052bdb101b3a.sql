
-- Tabela de ferramentas cadastradas para banners
CREATE TABLE public.ferramentas_banner (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  logo_url text,
  cor_tema text DEFAULT '#7C3AED',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ferramentas_banner ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view ferramentas_banner"
  ON public.ferramentas_banner FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert ferramentas_banner"
  ON public.ferramentas_banner FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update ferramentas_banner"
  ON public.ferramentas_banner FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete ferramentas_banner"
  ON public.ferramentas_banner FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_ferramentas_banner_updated_at
  BEFORE UPDATE ON public.ferramentas_banner
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de histórico de banners gerados
CREATE TABLE public.banners_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL,
  ferramenta_id uuid REFERENCES public.ferramentas_banner(id) ON DELETE SET NULL,
  titulo text,
  dados jsonb DEFAULT '{}',
  imagem_url text,
  prompt_usado text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.banners_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view banners_historico"
  ON public.banners_historico FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert banners_historico"
  ON public.banners_historico FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can delete banners_historico"
  ON public.banners_historico FOR DELETE TO authenticated USING (true);

-- Storage bucket para banners
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true);

CREATE POLICY "Authenticated users can upload banners"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'banners');
CREATE POLICY "Anyone can view banners"
  ON storage.objects FOR SELECT USING (bucket_id = 'banners');
CREATE POLICY "Authenticated users can delete banners"
  ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'banners');

-- Seed ferramentas iniciais
INSERT INTO public.ferramentas_banner (nome, cor_tema) VALUES
  ('Leonardo.AI', '#FF6B35'),
  ('MidJourney', '#0066FF'),
  ('ChatGPT', '#10A37F'),
  ('Kling AI', '#FF4081'),
  ('Runway', '#6366F1'),
  ('Stable Diffusion', '#A855F7'),
  ('ElevenLabs', '#000000'),
  ('Suno AI', '#F59E0B'),
  ('DALL-E', '#412991');
