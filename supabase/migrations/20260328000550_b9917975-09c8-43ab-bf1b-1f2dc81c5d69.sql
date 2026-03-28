
ALTER TABLE public.configuracoes_acesso
  ADD COLUMN video_url text NOT NULL DEFAULT '/videos/diclaok.mp4',
  ADD COLUMN dicloak_url text NOT NULL DEFAULT 'https://dicloak.com/pt/download';
