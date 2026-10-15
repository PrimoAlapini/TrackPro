---
inclusion: always
---

# TrackPro : structure du projet

```
trackpro/
├─ docs/maquettes/          ← images de référence (voir README.md dans ce dossier)
├─ supabase/migrations/     ← SQL : tables, triggers, RLS
├─ public/                  ← logos (voir design-system.md), favicon
└─ src/
   ├─ app/                  ← router, providers, AuthGuard, AppLayout (sidebar + en-tête)
   ├─ components/
   │  ├─ ui/                ← Button, Card, StatusBadge, ProgressBar, Avatar, Modal, Input…
   │  └─ charts/            ← BarChart, Donut
   ├─ features/
   │  ├─ auth/              ← connexion, session
   │  ├─ dossiers/          ← formulaire, sélecteur de dossier actif, affectation membres
   │  ├─ membres/           ← annuaire
   │  ├─ pieces/            ← gestion par dossier (ajouter, modifier, réordonner, supprimer)
   │  ├─ suivi/             ← statuts par personne et par pièce, modal de pièce
   │  └─ stats/             ← KPI, progression par pièce et par personne
   ├─ lib/                  ← client Supabase, stats.ts (calculs purs), formats de date
   ├─ pages/                ← Login, Dashboard, Pieces, Stats, Membres, Parametres
   ├─ styles/tokens.css     ← variables clair / sombre
   └─ types/database.ts     ← types générés
```

## Règles
- Une feature contient ses composants, ses hooks (`api.ts`) et ses schémas zod ; elle n'importe pas une autre feature, seulement `components/`, `lib/` et `types/`.
- `components/ui` ne connaît ni Supabase ni le métier.
- Une page assemble des features ; elle ne contient pas de logique de calcul.
- Fichiers de composants en `PascalCase.tsx`, hooks en `useXxx.ts`, utilitaires en `camelCase.ts`.
- Routes : `/login`, `/` (tableau de bord), `/pieces`, `/statistiques`, `/membres`, `/parametres`. Toutes sauf `/login` sont protégées.
- Les modals (nouveau/modifier dossier, pièce) sont des composants ouverts depuis les pages, pas des routes.
