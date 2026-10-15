-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create statut_piece enum
CREATE TYPE public.statut_piece AS ENUM ('deposee', 'en_cours', 'non_deposee');

-- Create sequence for dossier reference
CREATE SEQUENCE public.dossier_ref_seq START 1;

-- Create dossiers table
CREATE TABLE public.dossiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE DEFAULT ('TRK-' || LPAD(NEXTVAL('public.dossier_ref_seq')::TEXT, 3, '0')),
  nom TEXT NOT NULL,
  description TEXT,
  date_debut DATE NOT NULL,
  date_limite DATE NOT NULL,
  responsable_collecte TEXT,
  responsable_revue TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT date_limite_gte_date_debut CHECK (date_limite >= date_debut)
);

-- Create membres table
CREATE TABLE public.membres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  couleur_avatar TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create dossier_membres junction table
CREATE TABLE public.dossier_membres (
  dossier_id UUID NOT NULL REFERENCES public.dossiers(id) ON DELETE CASCADE,
  membre_id UUID NOT NULL REFERENCES public.membres(id) ON DELETE CASCADE,
  PRIMARY KEY (dossier_id, membre_id)
);

-- Create pieces table
CREATE TABLE public.pieces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  description TEXT,
  ordre INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create suivi_pieces table
CREATE TABLE public.suivi_pieces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID NOT NULL,
  membre_id UUID NOT NULL,
  piece_id UUID NOT NULL REFERENCES public.pieces(id) ON DELETE CASCADE,
  statut public.statut_piece NOT NULL DEFAULT 'non_deposee',
  date_depot DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (dossier_id, membre_id, piece_id),
  FOREIGN KEY (dossier_id, membre_id) REFERENCES public.dossier_membres(dossier_id, membre_id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_suivi_pieces_dossier_id ON public.suivi_pieces(dossier_id);
CREATE INDEX idx_suivi_pieces_membre_id ON public.suivi_pieces(membre_id);
CREATE INDEX idx_suivi_pieces_piece_id ON public.suivi_pieces(piece_id);
CREATE INDEX idx_dossier_membres_dossier_id ON public.dossier_membres(dossier_id);
CREATE INDEX idx_dossier_membres_membre_id ON public.dossier_membres(membre_id);

-- Trigger: Create suivi entries when a member is added to a dossier
CREATE OR REPLACE FUNCTION public.creer_suivi_pour_membre()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.suivi_pieces (dossier_id, membre_id, piece_id)
  SELECT new.dossier_id, new.membre_id, p.id
  FROM public.pieces p
  ON CONFLICT DO NOTHING;
  RETURN new;
END $$;

CREATE TRIGGER trg_dossier_membres_suivi
AFTER INSERT ON public.dossier_membres
FOR EACH ROW
EXECUTE FUNCTION public.creer_suivi_pour_membre();

-- Trigger: Create suivi entries when a new piece is added
CREATE OR REPLACE FUNCTION public.creer_suivi_pour_piece()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.suivi_pieces (dossier_id, membre_id, piece_id)
  SELECT dm.dossier_id, dm.membre_id, new.id
  FROM public.dossier_membres dm
  ON CONFLICT DO NOTHING;
  RETURN new;
END $$;

CREATE TRIGGER trg_pieces_suivi
AFTER INSERT ON public.pieces
FOR EACH ROW
EXECUTE FUNCTION public.creer_suivi_pour_piece();

-- Trigger: Manage date_depot based on statut
CREATE OR REPLACE FUNCTION public.maj_date_depot()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF new.statut = 'deposee' THEN
    IF TG_OP = 'INSERT' OR old.statut IS DISTINCT FROM 'deposee' THEN
      new.date_depot := CURRENT_DATE;
    END IF;
  ELSE
    new.date_depot := NULL;
  END IF;
  
  new.updated_at := NOW();
  RETURN new;
END $$;

CREATE TRIGGER trg_suivi_date_depot
BEFORE INSERT OR UPDATE OF statut ON public.suivi_pieces
FOR EACH ROW
EXECUTE FUNCTION public.maj_date_depot();
