# Guide d'intégration — recommandations IA

Le module compare les compétences observées d'un collaborateur aux exigences du poste. Pour chaque exigence manquante, il recherche une compétence sémantiquement proche puis des formations actives par similarité cosinus pgvector. Le résultat est équilibré entre les compétences (round-robin), limité à cinq formations et dédoublonné.

## Prérequis

1. Les tables `competences` et `formations` doivent posséder des embeddings `vector(1536)`.
2. Ollama doit exposer `nomic-embed-text` sur `http://localhost:11434`; l'API utilise `POST /api/embeddings` avec `{ "model": "nomic-embed-text", "prompt": "…" }`.
3. Le collaborateur doit avoir des lignes `employee_competences`; le poste des lignes `competence_matrices`.

## API

```http
GET /api/competences/gaps/{utilisateurId}?posteId={posteId}
GET /api/competences/recommendations/{utilisateurId}?posteId={posteId}
```

Les deux UUID sont obligatoires. Une valeur mal formée renvoie `400`; une erreur de dépendance ou de données renvoie `500`.

Exemple de sortie recommandations :

```json
{
  "utilisateur_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "poste_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  "recommandations": [{
    "formation_id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
    "titre": "Développement backend avec NestJS",
    "score_pertinence": 0.91,
    "competence_id": "dddddddd-dddd-dddd-dddd-dddddddddddd",
    "competence_nom": "NestJS",
    "current_level": 1,
    "required_level": 3,
    "gap": 2,
    "motif": "Recommandée pour combler l'écart sur \"NestJS\" (niveau 1 → 3)"
  }]
}
```

`score_pertinence` est une similarité cosinus estimée : il sert à classer, pas à représenter un taux de réussite. Le seuil de compétence sémantiquement proche est actuellement `0.8`.

## Parcours client recommandé

1. Appeler `gaps` et afficher les niveaux actuels/requis.
2. Appeler `recommendations` avec les mêmes UUID.
3. Proposer une session de la formation retenue et créer une inscription via `POST /api/enrollments`.
4. Après le quiz, lire le résultat de `POST /api/quiz-attempts` pour rafraîchir l'affichage de la progression.

Une inscription crée désormais une tâche `suivre_formation` dans `learning_tasks` et un événement `inscription_formation` dans `performance_events`. Un résultat de quiz crée une tâche `formation_validee` ou `revoir_quiz`, puis publie `quiz_termine` pour Performance. Lorsqu'un quiz est validé, les compétences liées à la formation sont élevées au `niveau_vise` dans `employee_competences` et une certification est créée pour chaque compétence liée.
