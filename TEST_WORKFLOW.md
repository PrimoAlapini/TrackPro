# Test Workflow - Pièces par Dossier

## Prérequis
- Migration `003_pieces_per_dossier.sql` appliquée dans Supabase
- Dev server running: `npm run dev` → localhost:5175

## Workflow complet

### 1. Créer un dossier
- Allez sur **Dashboard** (page par défaut)
- Cliquez **Créer un dossier**
- Remplissez:
  - Nom: "Test Pièces"
  - Date début: 17/10/2026
  - Date limite: 31/10/2026
  - Description: (optionnel)
- Cliquez **Ajouter**

**Attendre:** Le dossier apparaît dans la liste et devient le dossier actif

---

### 2. Aller sur Pièces du dossier
- Cliquez sur **Pièces** dans la sidebar
- Vous êtes sur la page "Pièces du dossier" avec le dossier sélectionné

**Attendre:**
- Titre: "Pièces du dossier" avec nom du dossier
- État vide: "Aucune pièce" avec bouton "Ajouter une pièce"

---

### 3. Ajouter des pièces
- Cliquez **Ajouter une pièce**
- Modal s'ouvre: "Ajouter une pièce"
- Remplissez:
  - Nom: "Pièce d'identité" *
  - Description: "Copie lisible des deux côtés"
- Cliquez **Ajouter**

**Attendre:**
- Modal ferme
- Pièce apparaît dans la liste (avec icône poignée)
- Les lignes de suivi "Non déposée" se créent pour chaque membre affecté (trigger)

Répétez pour ajouter 3-4 pièces:
- "Justificatif de domicile"
- "Document bancaire"
- "Certificat médical"

---

### 4. Affecter des membres
- Dans section "Membres concernés" (0 affecté)
- Cliquez **Affecter**
- Modal s'ouvre: "Affecter des membres"
- Cliquez **Créer un nouveau membre** (si aucun existe)
  - Tapez: "Alice Martin"
  - Cliquez **Créer**
- Cochez Alice dans la liste
- Cliquez **Fermer**

**Attendre:**
- Alice apparaît dans section "Membres concernés"
- Nombre passe de "0" à "1"
- Bouton d'affectation affiche "Affecter"

Répétez pour ajouter 1-2 autres membres:
- "Bob Dupont"
- "Chloé Lefevre"

---

### 5. Vérifier suivi_pieces (automatique)
- Après affectation d'un membre, les lignes suivi_pieces se créent automatiquement (trigger)
- Chaque ligne = (piece_id, dossier_id, membre_id, statut='non_deposee')

**Expected:**
- 3 pièces × 3 membres = 9 lignes suivi_pieces

---

### 6. Consulter le tableau Suivi
- Section "Suivi des pièces - [Nom du premier membre]" s'affiche
- Tableau:
  - Colonnes: Pièce, Statut, Date de dépôt, Action (oeil)
  - 3 lignes (une par pièce du dossier pour ce membre)
  - Tous les statuts = "Non déposée"
  - Toutes les dates = "-"

---

### 7. Changer le statut d'une pièce
- Cliquez sur l'**oeil** d'une pièce dans le tableau
- Modal s'ouvre: "Mise à jour du statut"
  - Affiche: pièce, membre, 3 boutons (Non déposée, En cours, Déposée)
- Sélectionnez **En cours**
- Cliquez **Confirmer**

**Attendre:**
- Modal ferme
- Tableau se met à jour: statut = "En cours"
- Date de dépôt reste "-" (change seulement quand statut = "Déposée")

Répétez pour une autre pièce:
- Changez à **Déposée**

**Attendre:**
- Statut = "Déposée"
- Date de dépôt = aujourd'hui (timestamp)

---

### 8. Changer de membre
- Cliquez sur un autre membre dans section "Membres concernés"
- Tableau se met à jour: affiche suivi pour ce membre
- Vérifiez les statuts = "Non déposée" (defaults)

---

### 9. Réordonner les pièces (drag-drop)
- Survolez une pièce dans la liste
- Icône poignée (6 points) apparaît
- Glissez une pièce vers le haut/bas
- Relâchez

**Attendre:**
- Pièce se réordonne
- Numéro d'ordre (colonne `ordre`) mis à jour

---

### 10. Éditer une pièce
- Cliquez **Crayon** sur une pièce
- Modal s'ouvre: "Modifier la pièce" (préfilled)
- Changez la description: "Obligatoire"
- Cliquez **Modifier**

**Attendre:**
- Modal ferme
- Description mise à jour dans la liste

---

### 11. Supprimer une pièce
- Cliquez **Corbeille** sur une pièce
- Confirmation: "Êtes-vous sûr de vouloir supprimer cette pièce ?"
- Cliquez **OK**

**Attendre:**
- Pièce disparaît
- Lignes suivi_pieces corrigées (trigger `ON DELETE CASCADE`)
- Tableau suivi se met à jour

---

### 12. Retirer un membre
- Section "Membres concernés"
- Cliquez **Affecter**
- Décochez un membre
- Cliquez **Fermer**

**Attendre:**
- Membre disparaît de la section
- Lignes suivi_pieces supprimées pour ce membre (trigger)
- Tableau se réinitialise sur le premier membre restant

---

## Vérifications finales

✅ **Database:**
- `pieces` table: colonnes `dossier_id`, `ordre`
- `suivi_pieces` table: FK composite `(piece_id, dossier_id)`
- Triggers fonctionnent (suivi_pieces auto-créées)

✅ **UI:**
- Page Pièces affiche le dossier actif
- Modals s'ouvrent/ferment correctement
- Tableau suivi met à jour au changement de statut
- Drag-drop réordonne pièces

✅ **Données:**
- date_depot = NULL jusqu'à "Déposée"
- date_depot = aujourd'hui après "Déposée"
- % progression mis à jour sur Dashboard

---

## Notes
- Si erreur TypeScript: 8 erreurs "never" sont attendues (Supabase client type inference bug)
- Erreurs runtime: Vérifier console browser + Network tab (API calls)
- Si suivi_pieces ne se peuplent pas: Vérifier que triggers Supabase se sont appliqués correctement

