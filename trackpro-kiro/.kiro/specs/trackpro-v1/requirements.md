# Exigences : TrackPro V1

Contexte et règles métier : voir `.kiro/steering/product.md`.

### R1. Connexion
**En tant qu'** administrateur, **je veux** me connecter, **afin d'** accéder à la plateforme.
- QUAND je saisis un email et un mot de passe valides, ALORS j'arrive sur le tableau de bord.
- QUAND les identifiants sont invalides, ALORS un message d'erreur en français s'affiche.
- QUAND je ne suis pas connecté et que j'ouvre une page protégée, ALORS je suis redirigé vers `/login`.
- Il n'existe aucune inscription publique.
- Le menu utilisateur propose « Se déconnecter ».

### R2. Thème clair / sombre
**En tant qu'** administrateur, **je veux** un thème clair et un thème sombre, **afin de** travailler confortablement.
- Au premier chargement, le thème suit le réglage du système.
- Le menu utilisateur permet de choisir Système / Clair / Sombre ; le choix est mémorisé.
- Aucun flash de mauvais thème au chargement.
- Tous les écrans sont lisibles et fidèles à la maquette dans les deux thèmes.

### R3. Pièces par dossier
**En tant qu'** administrateur, **je veux** gérer les pièces **de chaque dossier**, **afin d'** adapter le suivi.
- Chaque dossier a ses propres pièces. Il n'existe plus de catalogue commun.
- Je peux ajouter, modifier (nom, description facultative), réordonner et supprimer une pièce du dossier actif **depuis la page « Pièces du dossier »**.
- La suppression demande confirmation et supprime aussi le suivi associé.
- QUAND j'ajoute une pièce, ALORS une ligne « Non déposée » est créée pour chaque membre affecté à ce dossier.

### R4. Membres du dossier
**En tant qu'** administrateur, **je veux** affecter des membres au dossier actif, **afin de** suivre leur progression.
- La page « Pièces du dossier » permet d'affecter ou retirer des membres.
- Je peux créer un membre à la volée depuis le modal d'affectation.
- QUAND j'affecte une personne au dossier, ALORS ses lignes de suivi sont créées en « Non déposée » pour toutes les pièces du dossier.
- QUAND je la retire du dossier, ALORS ses lignes de suivi sont supprimées.

### R5. Annuaire des membres
**En tant qu'** administrateur, **je veux** gérer les personnes, **afin de** les affecter aux dossiers.
- La page Membres affiche la liste de tous les membres : avatar, nom, dossiers affectés, progression globale.
- Les UUID ne sont jamais affichés.
- Je peux ajouter, modifier et supprimer un membre (nom, couleur d'avatar), avec confirmation de suppression.
- Cliquer sur un membre ouvre un modal : dossiers affectés et, pour chaque dossier, ses pièces avec statut et date de dépôt, plus lien vers « Pièces du dossier ».

### R5. Dossiers
**En tant qu'** administrateur, **je veux** créer et modifier des dossiers, **afin de** suivre des dépôts.
- Le formulaire contient : nom (obligatoire), description, date de début (obligatoire), date limite (obligatoire, ≥ date de début), responsable de collecte (facultatif), responsable qui revoit (facultatif).
- La référence `TRK-xxx` est générée automatiquement.
- Je choisis le dossier actif dans l'en-tête ; je peux le modifier ou le supprimer (avec confirmation).

### R6. Suivi des pièces
**En tant qu'** administrateur, **je veux** changer le statut d'une pièce pour une personne.
- Un modal affiche le nom de la pièce et de la personne, la description (seulement si elle existe) et un sélecteur de statut (Déposée / En cours / Non déposée).
- QUAND je passe à « Déposée », ALORS la date du jour est enregistrée ; pour un autre statut, la date est vidée.
- Pas de téléversement de fichier en V1.

### R7. Pièces du dossier
- Affiche les pièces du dossier actif avec liste complète par membre (sélecteur, tableau avec suivi, modal).
- Bouton « Ajouter une pièce » : modal nom obligatoire, description facultative.
- Liste des pièces du dossier : modifier, supprimer, réordonner (glisser-déposer).
- Section « Membres concernés » : affecter/retirer membres, création à la volée.
- Suivi des statuts par personne : sélecteur, tableau (pièce, statut, date), clic → modal.
- États vides : « Ajouter une pièce » si aucune, « Affecter des membres » si aucun.

### R8. Tableau de bord
- Titre, sélecteur dossier actif, bouton « Nouveau dossier ».
- 4 cartes : Total des pièces **du dossier actif**, En cours, Déposées, Non déposées (nombre + %).
- Progression par pièce **du dossier**, progression par personne affectée, répartition des statuts (donut).

### R9. Statistiques
- Page reprenant progression par pièce du dossier, progression par personne affectée, barres et donut.

### R10. Paramètres
**En tant qu'** administrateur, **je veux** gérer mon compte, **afin de** sécuriser mon accès.
- Page affichant email (en lecture seule), changement de mot de passe.
- Pas de catalogue de pièces (géré par dossier).

### R11. États vides, chargement, erreurs
- La plateforme démarre vide : chaque écran propose une action (« Créer un dossier », « Ajouter un membre », « Ajouter une pièce »).
- Des états de chargement et d'erreur en français sont présents.

### R12. Responsive
- Desktop et mobile : sidebar en tiroir, cartes empilées, tableaux avec défilement horizontal.

### R13. Éléments inactifs
- La barre de recherche et la cloche sont visibles mais non fonctionnelles en V1.
