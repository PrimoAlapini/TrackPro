-- Enable Row Level Security
ALTER TABLE public.dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dossier_membres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suivi_pieces ENABLE ROW LEVEL SECURITY;

-- Create RLS policies: all authenticated users have full access
CREATE POLICY "Allow authenticated users to access dossiers" ON public.dossiers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to access membres" ON public.membres
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to access dossier_membres" ON public.dossier_membres
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to access pieces" ON public.pieces
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to access suivi_pieces" ON public.suivi_pieces
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
