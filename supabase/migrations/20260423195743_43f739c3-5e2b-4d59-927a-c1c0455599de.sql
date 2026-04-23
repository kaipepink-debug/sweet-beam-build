CREATE TABLE public.vturb_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id TEXT NOT NULL,
  script_url TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID
);

ALTER TABLE public.vturb_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read vturb_config"
ON public.vturb_config FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert vturb_config"
ON public.vturb_config FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update vturb_config"
ON public.vturb_config FOR UPDATE
TO authenticated
USING (true);

CREATE TRIGGER update_vturb_config_updated_at
BEFORE UPDATE ON public.vturb_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.vturb_config (player_id, script_url) VALUES (
  'vid-69ea78473ddf72965955cba7',
  'https://scripts.converteai.net/f41188e2-93d0-4ef5-9a84-f424cdfd9e46/players/69ea78473ddf72965955cba7/v4/player.js'
);