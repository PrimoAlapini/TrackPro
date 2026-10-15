-- Migration 003: Pièces par dossier (rupture avec catalogue commun)
-- Stratégie: Repartir de zéro - suppression des données actuelles

-- Étape 1: Supprimer suivi_pieces (dépend de pieces)
DELETE FROM suivi_pieces;

-- Étape 2: Supprimer pieces
DELETE FROM pieces;

-- Étape 3: Restructurer table pieces
-- Ajouter dossier_id et le rendre obligatoire + FK
ALTER TABLE pieces
ADD COLUMN dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE;

-- Étape 4: Ajouter contrainte unique (dossier_id, id)
ALTER TABLE pieces
ADD CONSTRAINT pieces_unique_per_dossier UNIQUE(dossier_id, id);

-- Étape 5: Créer indices pour performance
CREATE INDEX pieces_dossier_id_idx ON pieces(dossier_id);
CREATE INDEX pieces_ordre_idx ON pieces(dossier_id, ordre);

-- Étape 6: Ajouter dossier_id à suivi_pieces (déjà présent, vérifier)
-- Si absent, l'ajouter:
-- ALTER TABLE suivi_pieces ADD COLUMN dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE;

-- Étape 7: Créer FK composite: (piece_id, dossier_id) → pieces(id, dossier_id)
ALTER TABLE suivi_pieces
DROP CONSTRAINT IF EXISTS suivi_pieces_piece_id_fkey;

ALTER TABLE suivi_pieces
ADD CONSTRAINT suivi_pieces_piece_dossier_fkey
FOREIGN KEY (piece_id, dossier_id)
REFERENCES pieces(id, dossier_id)
ON DELETE CASCADE;

-- Étape 8: Trigger - Création automatique de suivi quand une pièce est créée
CREATE OR REPLACE FUNCTION create_suivi_for_new_piece()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO suivi_pieces (piece_id, dossier_id, membre_id, statut, created_at, updated_at)
  SELECT NEW.id, NEW.dossier_id, dm.membre_id, 'non_deposee', NOW(), NOW()
  FROM dossier_membres dm
  WHERE dm.dossier_id = NEW.dossier_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_suivi_on_piece ON pieces;
CREATE TRIGGER trg_create_suivi_on_piece
AFTER INSERT ON pieces
FOR EACH ROW
EXECUTE FUNCTION create_suivi_for_new_piece();

-- Étape 9: Trigger - Création automatique de suivi quand un membre est affecté
CREATE OR REPLACE FUNCTION create_suivi_for_new_member_assignment()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO suivi_pieces (piece_id, dossier_id, membre_id, statut, created_at, updated_at)
  SELECT p.id, NEW.dossier_id, NEW.membre_id, 'non_deposee', NOW(), NOW()
  FROM pieces p
  WHERE p.dossier_id = NEW.dossier_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_suivi_on_member_assignment ON dossier_membres;
CREATE TRIGGER trg_create_suivi_on_member_assignment
AFTER INSERT ON dossier_membres
FOR EACH ROW
EXECUTE FUNCTION create_suivi_for_new_member_assignment();

-- Étape 10: Trigger - Suppression de suivi quand un membre est retiré
CREATE OR REPLACE FUNCTION delete_suivi_on_member_removal()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM suivi_pieces
  WHERE dossier_id = OLD.dossier_id AND membre_id = OLD.membre_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_delete_suivi_on_member_removal ON dossier_membres;
CREATE TRIGGER trg_delete_suivi_on_member_removal
AFTER DELETE ON dossier_membres
FOR EACH ROW
EXECUTE FUNCTION delete_suivi_on_member_removal();

-- Étape 11: Vérification - les tables sont maintenant liées correctement
-- pieces.dossier_id → dossiers.id
-- suivi_pieces.(piece_id, dossier_id) → pieces.(id, dossier_id)
-- suivi_pieces.(dossier_id, membre_id) → dossier_membres.(dossier_id, membre_id)
