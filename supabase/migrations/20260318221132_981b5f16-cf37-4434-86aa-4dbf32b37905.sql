
-- Create gmails table
CREATE TABLE public.gmails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gmail text NOT NULL,
  senha text NOT NULL,
  email_recuperacao text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gmails ENABLE ROW LEVEL SECURITY;

-- RLS policy for admins
CREATE POLICY "Admins can manage gmails" ON public.gmails
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add gmail_id to acessos table
ALTER TABLE public.acessos ADD COLUMN gmail_id uuid REFERENCES public.gmails(id) ON DELETE SET NULL;

-- Updated_at trigger for gmails
CREATE TRIGGER update_gmails_updated_at
  BEFORE UPDATE ON public.gmails
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
