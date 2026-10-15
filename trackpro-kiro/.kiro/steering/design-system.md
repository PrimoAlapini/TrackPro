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
- Sidebar 248px : logo, 5 entrées (Tableau de bord, Pièces du dossier, Statistiques, Membres, Paramètres), entrée active en `--primary`, carte « Chaque étape vous rapproche de votre objectif. » en bas.
- En-tête : recherche (inactive), sélecteur « Dossier actif », cloche (inactive), menu utilisateur.
- Mobile : sidebar en tiroir (menu hamburger), cartes empilées, tableaux avec défilement horizontal.

## Logo
Le client fournit une version transparente. Fichiers attendus dans `public/` : `logo.svg` (ou `.png`) pour fond sombre et `logo-light.svg` (ou `.png`) pour fond clair ; afficher l'un ou l'autre selon le thème. Ne jamais redessiner le logo en code.

## Écarts volontaires avec l'image d'origine (`TrackPro_Dashboard_Design_Showcase.png`)
- Menu « Mes dossiers » supprimé ; un sélecteur de dossier actif le remplace dans l'en-tête.
- « Total des dossiers » devient « Total des pièces suivies » ; la carte « En attente » devient « Non déposées ».
- Onglets « Historique » et « Commentaires » et filtre « 7 derniers jours » supprimés.
- Un dossier n'est pas lié à une personne.
