# RH IA Formation

Plateforme RH destinée au suivi des compétences, des formations, des quiz et des certifications des employés.

## Fonctionnalités

- gestion des profils employés et des compétences ;
- cartographie des compétences et détection des écarts ;
- recommandations de formations adaptées au profil ;
- inscription aux sessions et parcours e-learning ;
- quiz, calcul du score et validation de la réussite ;
- génération et téléchargement des certificats PDF ;
- documentation des API avec Swagger ;
- gestion des documents employés et stockage MinIO.

## Organisation du projet

```text
rh-ia-formation/
├── backend/                 # API NestJS, TypeORM, PostgreSQL
├── frontend/                # Application Next.js / React
├── swagger-local.json       # Documentation Swagger locale
├── swagger-improved.json    # Version améliorée de la documentation API
└── RAPPORT_TRAVAIL_RH_IA_LOT8.md
```

## Prérequis

- Node.js 20 ou version ultérieure ;
- npm ;
- PostgreSQL ;
- MinIO si le stockage des documents est utilisé.

## Installation

Cloner le dépôt puis installer les dépendances de chaque partie :

```bash
git clone https://github.com/benboudouhwissam-netizen/rh-ia-formation.git
cd rh-ia-formation

cd backend
npm install

cd ../frontend
npm install
```

Configurer les variables d’environnement du backend dans `backend/.env` selon votre base PostgreSQL, votre stockage MinIO et les services utilisés. Ne jamais publier ce fichier.

## Démarrage en développement

Dans un premier terminal :

```bash
cd backend
npm run start:dev
```

Dans un second terminal :

```bash
cd frontend
npm run dev
```

L’application frontend est ensuite accessible sur `http://localhost:3001` (ou sur le port indiqué par Next.js). L’API et l’interface Swagger sont disponibles sur le port configuré dans le backend.

## Tests et vérifications

Backend :

```bash
cd backend
npm test
npm run test:e2e
npm run build
```

Frontend :

```bash
cd frontend
npm run lint
npm run build
```

Les tests E2E Playwright se trouvent dans `frontend/tests`.

## Git

```bash
git add .
git commit -m "Description de la modification"
git push
```

## Documentation complémentaire

Le rapport détaillé du travail réalisé est disponible dans [RAPPORT_TRAVAIL_RH_IA_LOT8.md](./RAPPORT_TRAVAIL_RH_IA_LOT8.md). Les fichiers `swagger-local.json` et `swagger-improved.json` décrivent les endpoints de l’API.

