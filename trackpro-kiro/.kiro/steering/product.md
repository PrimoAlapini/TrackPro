---
inclusion: always
---

# TrackPro : produit

**TrackPro** est une mini plateforme web de suivi de la progression du dépôt de pièces dans des dossiers.
Slogan : « Vos dossiers, notre priorité ».

## Utilisateur
Un seul utilisateur : l'**administrateur**. Il se connecte (email + mot de passe), crée des dossiers, y affecte des personnes et suit le statut de chaque pièce pour chaque personne. Aucun autre rôle, aucune inscription publique.

## Langue et supports
- Interface **100 % en français** (dates au format `jj/mm/aaaa`).
- Desktop + responsive mobile.
- Thème **clair et sombre**, qui suit le réglage du système par défaut, avec bascule manuelle.

## Vocabulaire métier
- **Dossier** : un ensemble de pièces à collecter. Il n'est PAS lié à une personne : des personnes lui sont affectées. Référence auto `TRK-001`, `TRK-002`…
- **Membre** : une personne unique affectée à un ou plusieurs dossiers (nom + couleur d'avatar). Annuaire centralisé.
- **Pièce** : élément configurable **par dossier** (nom, description facultative, ordre). Chaque dossier a ses propres pièces.
- **Suivi** : le statut d'une pièce pour une personne dans un dossier.

## Statuts d'une pièce (uniquement ces trois)
`Déposée` · `En cours` · `Non déposée` (défaut : Non déposée).
Il n'existe PAS de statut « En attente ».

## Règles de calcul
- % d'une personne dans un dossier = pièces « Déposée » ÷ nombre total de pièces **DE CE DOSSIER**. « En cours » ne compte pas.
- Progression d'une pièce = nombre de personnes ayant « Déposée » ÷ nombre de personnes **affectées À CE DOSSIER** (affichage `x / N` + %).
- KPI du tableau de bord = lignes de suivi du dossier actif (personnes affectées × pièces du dossier) : total, en cours, déposées, non déposées.
- Tous les pourcentages sont arrondis à l'entier.
- Passage à « Déposée » : `date_depot` = date du jour. Passage à un autre statut : `date_depot` vidée.
- Le **dossier actif** est choisi dans le sélecteur de l'en-tête ; toutes les listes et statistiques portent sur lui.
- Ajouter une pièce à un dossier : créer les lignes de suivi manquantes en « Non déposée » pour les membres affectés.
- Affecter une personne à un dossier : créer les lignes de suivi manquantes en « Non déposée » pour les pièces du dossier.
- Retirer une personne d'un dossier : supprimer ses lignes de suivi de ce dossier.
- Supprimer une pièce d'un dossier : supprimer ses lignes de suivi.

## Périmètre V1
Connexion, Tableau de bord, Pièces du dossier (gestion + suivi), Statistiques, Membres, Paramètres (compte), modal « Nouveau / Modifier le dossier ».

## Hors périmètre V1 (ne pas construire)
Rôles multiples, inscription publique, téléversement de fichiers, onglets « Historique » et « Commentaires », filtre de période, recherche et notifications fonctionnelles (la barre de recherche et la cloche sont visibles mais inactives), données de démonstration (la plateforme démarre vide), toute fonctionnalité non listée.
