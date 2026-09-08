# Rapport de réalisation — Plateforme RH IA

## 1. Objectif du projet

Le projet consiste à construire un parcours complet de gestion des compétences et de formation :

> profil employé → détection des écarts → recommandation → inscription → e-learning → quiz → mise à jour des compétences → certification.

Le système intègre également les événements Performance et les données du dossier employé.

## 2. Architecture réalisée

### Backend

- NestJS et TypeORM.
- PostgreSQL pour les données métier.
- MinIO pour le stockage des certificats PDF.
- Swagger pour documenter les API.
- Modules principaux : authentification, compétences, formations, quiz, inscriptions, tâches d’apprentissage, Performance, certifications et Lot 3.

### Frontend

- Next.js avec React et TypeScript.
- AppShell commun avec navigation, notifications, recherche et état de connexion.
- Pages : catalogue, formation, compétences, profil, quiz, certification et support.
- Composants réutilisables pour les cartes, boutons, spinners, recommandations et notifications.

## 3. Base de données et migrations

Les migrations couvrent progressivement :

- les compétences et matrices de compétences ;
- les formations et associations formation-compétence ;
- les quiz, questions, réponses et résultats ;
- les tâches d’apprentissage ;
- les événements Performance ;
- les comptes employés et profils ;
- la distribution des sessions de formation ;
- les contrats, diplômes et documents du dossier employé Lot 3.

Les migrations importantes pour les dernières évolutions sont notamment `009_learning_tasks_and_quiz_profile.sql`, `010_performance_events.sql`, `019_two_sessions_per_formation.sql`, `021_session_distribution.sql`, `022_employee_lot3_profile.sql` et `023_lot3_employee_documents.sql`.

## 4. Fonctionnalités développées

### Authentification et profil

- création de compte et connexion employé ;
- consultation et modification du profil ;
- avatar employé ;
- conservation de l’accès à la matrice après déconnexion ;
- bouton de connexion/déconnexion dans la barre latérale.

### Compétences

- matrice des compétences par collaborateur ;
- niveaux de 0 à 5 avec code couleur du design system ;
- affichage des experts internes ;
- analyse des écarts par poste ;
- conservation des statistiques de Wissam Benboudouh dans la matrice.

### Recommandations

- calcul des recommandations à partir des écarts ;
- affichage des formations recommandées ;
- score de pertinence ;
- lien vers la formation correspondante.

### Formations et sessions

- catalogue de formations ;
- détail d’une formation ;
- sessions programmées ;
- plusieurs sessions par formation ;
- cas avec deux sessions, une session ou aucune session ;
- inscription de l’employé à une session.

### Parcours e-learning

- affichage des chapitres ;
- progression locale de l’employé ;
- validation des chapitres ;
- accès au quiz lorsque les chapitres sont terminés ;
- gestion du cas où le quiz n’est pas encore disponible.

### Quiz et Performance

- chargement des questions et réponses ;
- calcul du score ;
- vérification du seuil de réussite ;
- mise à jour du niveau de compétence après réussite ;
- création d’une tâche `formation_validee` ou `revoir_quiz` ;
- publication de l’événement `quiz_termine`.

### Certification — collaboration Lot 9

- vérification du score et du seuil requis ;
- récupération de la formation, de la date et du score ;
- génération du certificat PDF ;
- design du certificat harmonisé avec le modèle validé ;
- stockage du fichier dans MinIO ;
- enregistrement de la certification en base ;
- téléchargement depuis `/certifications/:id/download` ;
- affichage du certificat dans le profil employé.

### Dossier employé — collaboration Lot 3

- affichage du profil employé ;
- ajout et modification d’un contrat ;
- ajout et modification d’un diplôme ;
- ajout et modification d’un document ;
- aide de saisie expliquant les champs à remplir.

### Design system — collaboration Lot 11

- couleurs Sauge, Brume, Ocre et Encre ;
- cartes et boutons harmonisés ;
- icônes et barre de navigation ;
- adaptation responsive ;
- spinners lors des chargements ;
- harmonisation des écrans profil, compétences, formations et certifications.

## 5. Intégration Swagger

Les contrôleurs documentent les endpoints d’authentification, profil, compétences, écarts, recommandations, formations, sessions, inscriptions, quiz, tâches, événements Performance, certifications et Lot 3.

Swagger est accessible avec :

```text
http://localhost:3000/api/docs
```

Swagger documente les API backend. Les éléments visuels frontend et les tâches de gestion de projet sont vérifiés séparément.

## 6. Tests réalisés

### Tests backend

- 18 suites réussies ;
- 231 tests réussis ;
- tests des inscriptions, tâches, événements Performance, quiz et certifications.

### Test E2E Playwright

Le scénario `frontend/tests/learning-journey.spec.ts` vérifie le flux complet :

1. création d’un profil de test ;
2. création d’une compétence ;
3. détection d’un écart ;
4. récupération d’une recommandation ;
5. création d’une session ;
6. inscription ;
7. création d’une tâche d’apprentissage ;
8. création d’un événement d’inscription ;
9. création et passage du quiz ;
10. mise à jour de la compétence ;
11. création de la certification ;
12. vérification de l’événement `quiz_termine`.

Résultat vérifié : **1 test E2E réussi**.

### Compilation

- frontend `npm run build` : réussie ;
- backend `npm run build` : réussie ;
- vérification TypeScript frontend : aucune erreur.

## 7. Conclusion

Le projet couvre le flux métier demandé et les intégrations entre les modules Formation, Compétences et Performance. Les collaborations avec le Lot 3 pour le dossier employé, le Lot 9 pour la certification et le Lot 11 pour le design system sont intégrées dans l’implémentation et identifiées dans les fonctionnalités concernées.

Le parcours principal est validé par les tests backend et le test E2E Playwright.
