# Conception : TrackPro V1

## 1. Modèle de données (brouillon SQL, à valider avec `supabase db reset`)

```sql
create type public.statut_piece as enum ('deposee', 'en_cours', 'non_deposee');
create sequence public.dossier_ref_seq;

create table public.dossiers (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique
    default ('TRK-' || lpad(nextval('public.dossier_ref_seq')::text, 3, '0')),
  nom text not null,
  description text,
  date_debut date not null,
  date_limite date not null,
  responsable_collecte text,
  responsable_revue text,
  created_at timestamptz not null default now(),
  check (date_limite >= date_debut)
);

create table public.membres (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  couleur_avatar text not null,
  created_at timestamptz not null default now()
);

create table public.dossier_membres (
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
  membre_id uuid not null references public.membres(id) on delete cascade,
  primary key (dossier_id, membre_id)
);

create table public.pieces (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  description text,
  ordre integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.suivi_pieces (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null,
  membre_id uuid not null,
  piece_id uuid not null references public.pieces(id) on delete cascade,
  statut public.statut_piece not null default 'non_deposee',
  date_depot date,
  unique (dossier_id, membre_id, piece_id),
  foreign key (dossier_id, membre_id)
    references public.dossier_membres(dossier_id, membre_id) on delete cascade
);
```

### Triggers
```sql
create or replace function public.creer_suivi_pour_membre() returns trigger
language plpgsql as $$
begin
  insert into public.suivi_pieces (dossier_id, membre_id, piece_id)
  select new.dossier_id, new.membre_id, p.id from public.pieces p
  on conflict do nothing;
  return new;
end $$;
create trigger trg_dossier_membres_suivi after insert on public.dossier_membres
  for each row execute function public.creer_suivi_pour_membre();

create or replace function public.creer_suivi_pour_piece() returns trigger
language plpgsql as $$
begin
  insert into public.suivi_pieces (dossier_id, membre_id, piece_id)
  select dm.dossier_id, dm.membre_id, new.id from public.dossier_membres dm
  on conflict do nothing;
  return new;
end $$;
create trigger trg_pieces_suivi after insert on public.pieces
  for each row execute function public.creer_suivi_pour_piece();

create or replace function public.maj_date_depot() returns trigger
language plpgsql as $$
begin
  if new.statut = 'deposee' then
    if tg_op = 'INSERT' or old.statut is distinct from 'deposee' then
      new.date_depot := current_date;
    end if;
  else
    new.date_depot := null;
  end if;
  return new;
end $$;
create trigger trg_suivi_date_depot before insert or update of statut on public.suivi_pieces
  for each row execute function public.maj_date_depot();
```
La suppression d'un membre d'un dossier supprime son suivi grâce à la clé étrangère composite (`on delete cascade`).

### RLS
Activer la RLS sur les 5 tables, avec pour chacune une politique `for all to authenticated using (true) with check (true)`. Désactiver les inscriptions publiques dans les réglages d'authentification de Supabase.

## 2. Calculs (`src/lib/stats.ts`, fonctions pures)
- `personProgress(suivi, totalPieces)` : déposées ÷ `totalPieces`, arrondi.
- `pieceProgress(suivi, pieceId, totalMembres)` : déposées ÷ `totalMembres`, retourne aussi `x / N`.
- `statusCounts(suivi)` : `{ deposee, en_cours, non_deposee, total }` et % de chacun.
- `pieceBarColor(pct)` : 100 → success ; ≥ 67 → secondary ; ≥ 34 → primary ; sinon warning.

Jeu de test de référence (maquette) : 4 personnes × 6 pièces = 24 lignes ; 14 déposées (58 %), 5 en cours (21 %), 5 non déposées (21 %) ; personnes : 5/6 (83 %), 4/6 (67 %), 3/6 (50 %), 2/6 (33 %) ; pièces : 4/4, 2/4, 2/4, 0/4, 3/4, 3/4.

## 3. Routes et état
- Routes : voir `structure.md`.
- Dossier actif : stocké dans un contexte React et mémorisé en `localStorage` ; au démarrage, premier dossier de la liste s'il n'y en a pas.
- Personne sélectionnée (Dashboard, Pièces du dossier) : état local de la page, première personne par défaut.
- Clés TanStack Query : `['dossiers']`, `['membres']`, `['pieces']`, `['suivi', dossierId]`. Après une mutation, invalider la clé concernée.

## 4. Composants principaux
`AppLayout`, `Sidebar`, `Header` (recherche inactive, `ActiveDossierSelect`, cloche inactive, `UserMenu` avec thème), `KpiCard`, `PieceProgressList`, `PersonProgressList`, `PieceTable`, `PieceStatusModal`, `DossierFormModal`, `BarChart`, `Donut`, `StatusBadge`, `ProgressBar`, `Avatar`, `EmptyState`, `ConfirmDialog`.
