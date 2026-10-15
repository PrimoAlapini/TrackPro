---
inclusion: always
---

# TrackPro : stack technique

## Stack
- **Vite + React + TypeScript** (SPA, pas de SSR)
- **Tailwind CSS v4** + composants **shadcn/ui**
- **react-router** (mode bibliothèque)
- **Supabase** : base Postgres, authentification et backend (via `@supabase/supabase-js`)
- **TanStack Query** pour les données serveur
- **react-hook-form + zod** pour les formulaires
- **date-fns** (locale `fr`)
- **dnd-kit** pour réordonner les pièces
- **lucide-react** pour les icônes (style outline, jamais d'emoji)
- **Vitest** pour les tests (obligatoire sur `src/lib/stats.ts`)
- Police : **Space Grotesk** (400, 500, 600, 700)
- Aucune bibliothèque de graphiques : barres et donut en CSS/SVG.

## Conventions
- TypeScript strict, pas de `any`.
- Alias d'import `@/` vers `src/`.
- Les noms de tables et colonnes Supabase restent **en français** (définis dans `design.md`). Le code applicatif (composants, fonctions, variables) est **en anglais**. Les textes affichés sont **en français**.
- Les types viennent de `supabase gen types typescript` (`src/types/database.ts`), jamais écrits à la main.
- Tout accès Supabase passe par des hooks dans `features/*/api.ts` (TanStack Query) ; aucune requête directe dans les composants de page.
- Les calculs de pourcentage vivent **uniquement** dans `src/lib/stats.ts` (fonctions pures, testées) et sont réutilisés par le Dashboard et les Statistiques.
- Les couleurs et espacements passent par les tokens CSS (voir `design-system.md`), jamais en dur dans les composants.

## Supabase et sécurité
- RLS activée sur toutes les tables : accès réservé au rôle `authenticated`.
- Inscriptions publiques **désactivées** ; le compte admin est créé à la main dans Supabase.
- Variables d'environnement : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Ne jamais exposer la clé `service_role` côté front. Ne jamais committer `.env`.
- Le schéma vit dans `supabase/migrations/` (SQL versionné). Les règles de cohérence (création/suppression du suivi, date de dépôt, référence `TRK-xxx`) sont gérées par la base (triggers), pas par le front.

## Qualité
- Accessibilité : vrais `<button>`, `<a>`, `<label>` ; `aria-label` sur les boutons-icônes ; contraste suffisant dans les deux thèmes.
- Chaque écran a un état vide, un état de chargement et un état d'erreur en français.
- Vérifier chaque écran en clair ET en sombre avant de le considérer terminé.
