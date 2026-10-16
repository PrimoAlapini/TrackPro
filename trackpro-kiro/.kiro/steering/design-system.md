---
inclusion: fileMatch
fileMatchPattern: ["src/**/*.tsx", "src/**/*.css"]
---

# TrackPro : design system

Référence visuelle : les images de `docs/maquettes/` sont la vérité. Les valeurs ci-dessous en sont tirées. Le **sombre** correspond à la charte d'origine ; le **clair** a été validé par le client.

## Tokens (`src/styles/tokens.css`)

```css
:root {                      /* CLAIR */
  --background:#F8FAFC;  --sidebar:#FFFFFF;  --card:#FFFFFF;  --border:#E2E8F0;
  --track:#E2E8F0;       --input:#F8FAFC;
  --foreground:#0F172A;  --muted:#475569;
  --primary:#6366F1;     --primary-foreground:#FFFFFF;
  --secondary:#22D3EE;   --success:#10B981;  --warning:#F59E0B;  --danger:#EF4444;
  --badge-success-fg:#047857; --badge-success-bg:rgba(16,185,129,.14);
  --badge-progress-fg:#0E7490; --badge-progress-bg:rgba(34,211,238,.18);
  --badge-danger-fg:#B91C1C;  --badge-danger-bg:rgba(239,68,68,.12);
}
.dark {                      /* SOMBRE (charte) */
  --background:#0F172A;  --sidebar:#0B1325;  --card:#131D33;  --border:#23304A;
  --track:#1E293B;       --input:#0F172A;
  --foreground:#E2E8F0;  --muted:#94A3B8;
  --badge-success-fg:#34D399; --badge-success-bg:rgba(16,185,129,.16);
  --badge-progress-fg:#67E8F9; --badge-progress-bg:rgba(34,211,238,.14);
  --badge-danger-fg:#FCA5A5;  --badge-danger-bg:rgba(239,68,68,.16);
}
```
Couleurs de marque identiques dans les deux thèmes : primaire #6366F1 (indigo), secondaire #22D3EE (cyan), succès #10B981, warning #F59E0B, danger #EF4444.

## Thème
- Par défaut : suit `prefers-color-scheme` (système).
- Bascule Système / Clair / Sombre dans le menu utilisateur, mémorisée en `localStorage`.
- Un script inline dans `index.html` applique la classe `dark` avant le premier rendu (pas de flash).

## Typographie
Space Grotesk. Titre de page 30px/700 ; titre de carte 17px/600 ; texte 14–15px ; texte secondaire 13px en `--muted` ; minimum 12px.

## Composants
- **Carte** : fond `--card`, bordure 1px `--border`, rayon 16px, padding 20px.
- **Carte KPI** : carte avec léger dégradé de la couleur de l'indicateur, tuile d'icône 48px (rayon 12), valeur 30px/700, mini barre + %.
- **Bouton principal** : fond `--primary`, texte blanc, rayon 12px, hauteur 44px. **Secondaire** : contour fin, fond transparent.
- **Champ** : hauteur 46px, rayon 12px, fond `--input`, bordure `--border`.
- **Badge de statut** (pastille avec icône) : Déposée = vert + coche ; En cours = cyan + point ; Non déposée = rouge + croix.
- **Barre de progression** : piste `--track`, hauteur 7–8px, extrémités arrondies.
  - Couleur d'une pièce selon son % : 100 → succès ; ≥ 67 → secondaire ; ≥ 34 → primaire ; sinon → warning.
  - Couleur d'une personne = sa `couleur_avatar` (primaire, secondaire, succès ou warning).
- **Avatar** : cercle avec initiale ; texte blanc sur indigo, texte sombre (#0F172A) sur cyan, vert et orange.
- **Modal** : largeur 540px (pièce) ou 640px (dossier), rayon 20px, fond `--card`, fond d'écran assombri, bouton de fermeture.
- **Donut** : conic-gradient succès / secondaire / danger, total au centre (« 24 pièces »).
- **Diagramme en barres** : une colonne par pièce, % au-dessus, libellé court dessous.

## Mise en page

### En-tête (Header)
- **Gauche** : logo TrackPro (version thème), lien vers `/`.
- **Droite**, dans l'ordre : 
  1. Sélecteur « Dossier actif » (libellé gris « Dossier actif » + nom du dossier · TRK-xxx + chevron), menu déroulant avec liste des dossiers.
  2. Cloche (inactive en V1).
  3. Menu utilisateur (avatar + libellé « Admin » + chevron) : bascule thème (Système/Clair/Sombre) + « Se déconnecter ».
- **Barre de recherche** : supprimée (R12).
- **Mobile (<768px)** : sélecteur compact (TRK-xxx + chevron), cloche, avatar seul (pas de libellé « Admin »).

### FloatingMenu (Desktop ≥768px)
- **Position** : fixe, bas-droit (32px des bords), hauteur 52px, fond `--card`, bordure 1px `--border`, rayon 16px, ombre.
- **État replié** : poignée grip (aria-label="Déplacer le menu"), pastille avec icône page courante, libellé « Menu », chevron vers le haut.
- **Clic → Panneau drop-up** : largeur 248px, s'ouvre VERS LE HAUT juste au-dessus de la barre, 5 entrées (Tableau de bord, Pièces du dossier, Statistiques, Membres, Paramètres), entrée active fond `--primary` + texte blanc, chevron passe vers le bas.
- **Fermeture** : clic extérieur, Échap, ou clic sur entrée.
- **DRAGGABLE** : glisser la poignée (PointerEvents ou dnd-kit). Reste dans la fenêtre (clamp aux bords). Position mémorisée en localStorage (try/catch). Redimensionnement fenêtre → position recadrée pour rester visible.
- **Placement du panneau** : s'ouvre vers le HAUT par défaut ; s'il n'y a pas de place (menu en haut), s'ouvre vers le BAS.
- **Accessibilité** : bouton aria-expanded, panneau role="navigation" aria-label="Navigation principale", poignée aria-label="Déplacer le menu", déplacement au clavier (flèches si poignée focus).

### BottomNav (Mobile <768px)
- **Position** : fixe en bas, pleine largeur, hauteur 72px, fond `--card`, bordure haute 1px `--border`.
- **Contenu** : 5 icônes seulement (pas de texte), alignées horizontalement, réparties à égalité (100% ÷ 5).
- **Icône active** : pastille `--primary`, rayon 12px, 48×40px, icône blanche.
- **Icônes inactives** : texte `--muted`.
- **Chaque icône** : aria-label, pas de texte visible.
- **Pas de drag**.
- **Padding-bottom du contenu** : 72px (hauteur BottomNav) + 16px + env(safe-area-inset-bottom).

### Contenu principal
- **Sidebar supprimée** : contenu prend toute la largeur.
- **Padding-bottom** : ≥104px (FloatingMenu height 52px + 2×32px + gap) sur desktop ; 72px + 16px + safe-area sur mobile.

### Responsive général
- **Cartes** : empilées sur mobile, grille sur desktop.
- **Tableaux** : défilement horizontal si nécessaire.
- **Breakpoints** : <768px = mobile (BottomNav) ; ≥768px = desktop (FloatingMenu).

## Logo
Le client fournit une version transparente. Fichiers attendus dans `public/` : `logo.svg` (ou `.png`) pour fond sombre et `logo-light.svg` (ou `.png`) pour fond clair ; afficher l'un ou l'autre selon le thème. Ne jamais redessiner le logo en code.

## Écarts volontaires avec l'image d'origine (`TrackPro_Dashboard_Design_Showcase.png`)
- Menu « Mes dossiers » supprimé ; un sélecteur de dossier actif le remplace dans l'en-tête.
- « Total des dossiers » devient « Total des pièces suivies » ; la carte « En attente » devient « Non déposées ».
- Onglets « Historique » et « Commentaires » et filtre « 7 derniers jours » supprimés.
- Un dossier n'est pas lié à une personne.
