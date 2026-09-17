# Rapport de réalisation — Plateforme RH IA

## 1. Objectif

La plateforme couvre le parcours : profil employé, analyse des écarts, recommandation, inscription, formation e-learning ou présentielle, évaluation et certification.

## 2. Architecture

### Backend

- NestJS, TypeORM et PostgreSQL ;
- modules d’authentification, formations, sessions, inscriptions, compétences, quiz, certifications, notifications, Performance et chatbot ;
- Swagger disponible sur `http://localhost:3000/api/docs` ;
- stockage des certificats avec MinIO configuré par variables d’environnement.

### Frontend

- Next.js, React et TypeScript ;
- AppShell commun avec navigation, notifications, recherche et assistant RH ;
- pages catalogue, détail formation, compétences, profil, quiz, certification et support ;
- composants réutilisables et design system Sauge, Brume, Ocre et Encre.

## 3. Formations et sessions

- catalogue filtrable par recherche, catégorie, niveau et modalité ;
- modalités prises en charge : `presentiel` et `e_learning` ;
- cinq formations présentielles ajoutées avec sessions, salles, dates et capacités ;
- affichage des places restantes ;
- diminution des places après inscription ;
- parcours e-learning avec chapitres, progression et quiz lorsque celui-ci est disponible ;
- les formations présentielles ne proposent pas de parcours e-learning ni de quiz en ligne.

## 4. Compétences et recommandations

- matrice des compétences par collaborateur et par poste ;
- analyse des écarts et niveaux de 0 à 5 ;
- recommandations basées sur les compétences à renforcer et la popularité ;
- affichage des formations recommandées avec liens et images ;
- filtres par catégorie, niveau et modalité dans le catalogue.

## 5. Assistant RH conversationnel

- assistant intégré à toutes les pages via l’AppShell ;
- mode employé connecté : profil, certificats, matrice, graphe, recommandations personnalisées et inscription ;
- mode visiteur : questions générales sur la plateforme, les formations, les modalités et l’inscription ;
- recherche publique par catégorie, niveau ou modalité ;
- recommandations populaires accessibles aux visiteurs sans exposer de données personnelles ;
- cartes de formations avec images ;
- orientation vers le responsable RH lorsqu’une demande ne peut pas être traitée ;
- accès au chatbot conservé après déconnexion.

## 6. Authentification et sécurité

- mots de passe hachés avec `scrypt` et sel aléatoire ;
- sessions stockées sous forme de hash de token ;
- guard de session appliqué aux inscriptions, sessions et tentatives de quiz ;
- token transmis par le frontend aux appels API authentifiés ;
- validation des DTO avec `ValidationPipe`, whitelist et transformation ;
- CORS configurable par `CORS_ORIGINS` ;
- identifiants MinIO configurables par `MINIO_ACCESS_KEY` et `MINIO_SECRET_KEY`, obligatoires en production.

## 7. Swagger

Swagger documente les formations, sessions, inscriptions, compétences, recommandations, quiz, certifications, notifications, authentification et chatbot.

L’endpoint `POST /api/chatbot/message` accepte un identifiant employé optionnel pour le mode visiteur. Les endpoints du catalogue documentent le filtre `modalite` avec les valeurs `presentiel` et `e_learning`.

Les fichiers `swagger-local.json` et `swagger-improved.json` sont des snapshots régénérés depuis `/api/docs-json`.

## 8. Tests et validation

- backend build : réussi ;
- tests backend : 18 suites, 231 tests réussis ;
- frontend lint : aucune erreur ;
- frontend TypeScript : aucune erreur ;
- frontend build : réussi ;
- test E2E du parcours formation exécuté avec succès.

## 9. Conclusion

Le projet est organisé en modules frontend et backend cohérents, respecte les couleurs principales du design system et couvre les flux de formation, compétences, inscription, certification et assistance conversationnelle. Les contrôles d’authentification doivent continuer à être étendus aux autres contrôleurs métier avant une mise en production complète.
