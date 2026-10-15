# Stratégie de Migration : Règle métier « Pièces par dossier »

## Problème actuel
- Table `pieces` est partagée par tous les dossiers (catalogue commun)
- `suivi_pieces` lie pièce + dossier + membre
- **Migration requise:** chaque dossier doit avoir ses propres pièces

## Changements BDD

### 1. Table `pieces` — Ajouter `dossier_id`

```sql
ALTER TABLE pieces
ADD COLUMN dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE;

ALTER TABLE pieces
ADD UNIQUE(dossier_id, id);  -- Clé composite pour garantir unicité par dossier

DROP INDEX IF EXISTS pieces_ordre_idx;
CREATE INDEX pieces_dossier_id_idx ON pieces(dossier_id);
CREATE INDEX pieces_ordre_idx ON pieces(dossier_id, ordre);
```

**Impact:** Chaque pièce existe DANS UN SEUL dossier. Les pièces actuelles doivent être assignées à un dossier.

### 2. Table `suivi_pieces` — Ajouter FK composite

Clé étrangère composite `(piece_id, dossier_id)` vers `pieces(id, dossier_id)` :

```sql
ALTER TABLE suivi_pieces
DROP CONSTRAINT IF EXISTS suivi_pieces_piece_id_fkey;

ALTER TABLE suivi_pieces
ADD CONSTRAINT suivi_pieces_piece_dossier_fkey
FOREIGN KEY (piece_id, dossier_id)
REFERENCES pieces(id, dossier_id)
ON DELETE CASCADE;
```

**Impact:** Garantit qu'une ligne de suivi ne mélange jamais pièces de 2 dossiers.

### 3. Triggers — Création automatique de suivi

#### Trigger 1: Quand une pièce est créée
```sql
CREATE OR REPLACE FUNCTION create_suivi_for_new_piece()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO suivi_pieces (piece_id, dossier_id, membre_id, statut)
  SELECT NEW.id, NEW.dossier_id, dm.membre_id, 'non_deposee'
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
```

#### Trigger 2: Quand un membre est affecté à un dossier (INSERT dossier_membres)
```sql
CREATE OR REPLACE FUNCTION create_suivi_for_new_member_assignment()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO suivi_pieces (piece_id, dossier_id, membre_id, statut)
  SELECT p.id, NEW.dossier_id, NEW.membre_id, 'non_deposee'
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
```

#### Trigger 3: Quand un membre est retiré d'un dossier (DELETE dossier_membres)
```sql
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
```

## Stratégie de migration des données actuelles

### Option A: **Duplication** (Recommandé pour préserver le contexte)
- Pour chaque dossier existant + chaque pièce actuellement attachée à ce dossier, on crée une copie de la pièce `dossier_id = dossier_id`.
- Les données de suivi existantes restent intactes.
- **Résultat:** Chaque dossier a ses propres copies des pièces.
- **Avantage:** Préserve l'historique, permet customisation par dossier dès maintenant.
- **Risque:** Duplication de données si structure équivalente entre dossiers.

**Script:**
```sql
-- Copier chaque pièce dans chaque dossier (si dossiers existent)
INSERT INTO pieces (dossier_id, nom, description, ordre, created_at, updated_at, user_id)
SELECT d.id, p.nom, p.description, p.ordre, NOW(), NOW(), p.user_id
FROM pieces p
CROSS JOIN dossiers d
WHERE p.dossier_id IS NULL;  -- Pièces actuelles sans dossier assigné

-- Assigner dossier_id aux pièces existantes (si déjà liées)
-- UPDATE pieces SET dossier_id = ? WHERE id = ?
```

### Option B: **Repartir de zéro** (Nettoyage complet)
- Supprimer toutes les pièces et suivi existants.
- Commencer avec plateforme vide.
- Admin crée manuellement les pièces pour chaque dossier.
- **Avantage:** Zéro dette technique, structure claire.
- **Risque:** Perte des données actuelles (tests).

**Script:**
```sql
DELETE FROM suivi_pieces;
DELETE FROM pieces;
-- Plateforme vide, dossiers restent
```

## Choix demandé à l'utilisateur

**Quelle option préfères-tu ?**

- **Option A (Duplication):** Préserve les pièces test, chaque dossier a ses copies.
- **Option B (Repartir de zéro):** Nettoyage complet, début fresh.

**Réponds avec A ou B, et on applique.**

---

## Impacts dans le code TypeScript

1. **`src/types/database.ts`** — Régénérer depuis Supabase (ajout `dossier_id` sur `pieces`).
2. **`src/features/pieces/api.ts`** — Hooks de CRUD deviennent **scoped to dossier** (ajouter `dossier_id` param).
3. **`src/lib/stats.ts`** — Stats calculées sur pièces du dossier actif uniquement.
4. **Pages:** `Pieces`, `Dashboard`, `Stats` — filtrer les données par `activeDossierId`.

