# Tâches : TrackPro V1

Après chaque tâche : comparer avec l'image correspondante de `docs/maquettes/`, en clair et en sombre.

- [ ] 1. **Outillage**
  - [ ] 1.1 Installer Tailwind v4, shadcn/ui, react-router, TanStack Query, supabase-js, react-hook-form, zod, date-fns, dnd-kit, lucide-react, Vitest
  - [ ] 1.2 Configurer l'alias `@/`, le chargement de Space Grotesk et la langue `fr` dans `index.html`
- [ ] 2. **Design system** (R2)
  - [ ] 2.1 Créer `tokens.css` (clair + sombre) selon `design-system.md`
  - [ ] 2.2 Script anti-flash dans `index.html`, gestion du thème Système / Clair / Sombre
  - [ ] 2.3 Composants `ui/` : Button, Card, StatusBadge, ProgressBar, Avatar, Modal, Input, ConfirmDialog, EmptyState
  - [ ] 2.4 Page de test temporaire affichant tous les composants dans les deux thèmes (à supprimer ensuite)
- [ ] 3. **Supabase** (R3, R5, R6)
  - [ ] 3.1 Créer les migrations à partir de `design.md` et les valider avec `supabase db reset`
  - [ ] 3.2 Activer la RLS, désactiver les inscriptions publiques, créer le compte admin
  - [ ] 3.3 Générer `src/types/database.ts` et créer `lib/supabase.ts` avec les variables d'environnement
- [ ] 4. **Connexion et layout** (R1, R11, R12)
  - [ ] 4.1 Page Login (logo selon le thème) et AuthGuard
  - [ ] 4.2 AppLayout : Sidebar, Header (recherche et cloche inactives), UserMenu (thème, déconnexion)
  - [ ] 4.3 Version mobile : sidebar en tiroir
- [ ] 5. **Paramètres et Membres** (R3, R4)
  - [ ] 5.1 CRUD du catalogue de pièces avec réordonnancement et confirmation de suppression
  - [ ] 5.2 Changement de mot de passe dans l'encart Compte
  - [ ] 5.3 CRUD des membres avec couleur d'avatar
- [ ] 6. **Dossiers** (R5)
  - [ ] 6.1 DossierFormModal (création et modification) avec validation zod
  - [ ] 6.2 Sélecteur de dossier actif dans l'en-tête, modification et suppression confirmée
  - [ ] 6.3 Affectation des personnes avec création d'un membre à la volée
- [ ] 7. **Suivi des pièces** (R6, R7)
  - [ ] 7.1 PieceStatusModal (description seulement si elle existe, sélecteur de statut)
  - [ ] 7.2 Page « Pièces du dossier » avec choix de la personne
- [ ] 8. **Calculs et tableaux de bord** (R8, R9)
  - [ ] 8.1 `lib/stats.ts` + tests Vitest avec le jeu de référence de `design.md`
  - [ ] 8.2 KpiCard, progression par pièce et par personne
  - [ ] 8.3 BarChart, Donut, détail d'un dossier / personne
  - [ ] 8.4 Page Tableau de bord, page Statistiques
- [ ] 9. **Finitions** (R10, R11)
  - [ ] 9.1 États vides, chargement et erreurs sur tous les écrans
  - [ ] 9.2 Passage responsive mobile sur tous les écrans
  - [ ] 9.3 Revue finale : fidélité aux maquettes, accessibilité, thème clair et sombre
