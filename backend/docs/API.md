# API RH IA

L'API NestJS est préfixée par `/api`. La documentation interactive est disponible avec l'application sur `/api/docs` (Swagger UI). Le format JSON généré par Swagger est exposé par cette interface. Toutes les charges utiles sont en JSON.

## Conventions

- Les identifiants `id`, `utilisateurId`, `posteId`, `competenceId`, `formationId`, `quizId` et `training_session_id` sont des UUID.
- Les listes paginées renvoient `{ data, total, page, limit }` lorsque le service est paginé. Les routes de matrice et de recommandation renvoient leur objet métier directement.
- Erreurs communes : `400` (paramètre ou corps invalide), `404` (ressource absente), `409` (contrainte d'unicité), `500` (erreur interne). Les créations renvoient `201`, les suppressions `200`.

## Endpoints

### Formations

| Méthode | Route | Paramètres / corps | Réponse |
|---|---|---|---|
| GET | `/formations` | `page`, `limit`, `categorie`, `niveau`, `statut`, `search` facultatifs | `200` liste de formations |
| GET | `/formations/search` | mêmes filtres | `200` liste filtrée |
| GET | `/formations/similar/{competenceId}` | UUID de compétence | `200` formations proches par embedding |
| GET | `/formations/{id}/embedding` | UUID formation | `200` formation avec embedding généré |
| GET | `/formations/{id}` | UUID formation | `200`, `404` |
| POST | `/formations` | `titre` requis; `description`, `categorie`, `niveau`, `duree`, `statut` facultatifs | `201`, `400` |
| PUT | `/formations/{id}` | mêmes champs, partiels | `200`, `400`, `404` |
| DELETE | `/formations/{id}` | UUID formation | `200`, `404` |
| POST | `/formations/{id}/competences/{competenceId}` | `{ "niveauVise": 1..5 }` facultatif | `201`, `404` |
| POST | `/formations/embeddings/generate-missing` | aucun | `201` nombre d'embeddings générés |

### Compétences et cartographie

| Méthode | Route | Paramètres / corps | Réponse |
|---|---|---|---|
| GET | `/competences` | `page`, `limit`, `categorie`, `niveau`, `search` facultatifs | `200` liste |
| GET | `/competences/ping` | aucun | `200` `{ "ok": true }` |
| GET | `/competences/search/similar` | `query` requis | `200` compétences triées par similarité |
| GET | `/competences/{id}` | UUID compétence | `200`, `404` |
| POST | `/competences` | `nom` requis; `description`, `categorie`, `niveau` facultatifs | `201`, `400` |
| PUT | `/competences/{id}` | champs partiels | `200`, `400`, `404` |
| DELETE | `/competences/{id}` | UUID compétence | `200`, `404` |
| POST | `/competences/generate-missing-embeddings` | aucun | `201` |
| GET | `/employee-competences/{utilisateurId}` | UUID collaborateur | `200` niveaux du collaborateur |
| POST | `/employee-competences` | `utilisateur_id`, `competence_id`, `niveau` (1 à 5), `source?` | `201` crée/met à jour le profil de compétence |
| GET | `/employee-competences/detail/{id}` | UUID ligne d'évaluation | `200`, `404` |
| GET | `/employee-competences/matrix/all` | aucun | `200` matrice collaborateurs × compétences |
| GET | `/employee-competences/experts/top` | `limit` facultatif, défaut `5` | `200` experts groupés par compétence |
| GET | `/competence-matrices/poste/{posteId}` | UUID poste | `200` exigences du poste |
| GET | `/competence-matrices/detail/{id}` | UUID matrice | `200`, `404` |
| GET | `/competence-matrices/postes/liste` | aucun | `200` postes distincts |
| GET | `/competence-matrices/ecarts/{posteId}` | UUID poste | `200` écarts agrégés |

### Recommandations IA

| Méthode | Route | Paramètres | Réponse |
|---|---|---|---|
| GET | `/competences/gaps/{utilisateurId}` | `posteId` requis | `200` écarts détaillés |
| GET | `/competences/recommendations/{utilisateurId}` | `posteId` requis | `200` top 5 des formations recommandées |

### Sessions, inscriptions et quiz

Les ressources suivantes suivent le même contrat REST : `GET /ressource` (filtres de la ressource), `GET /ressource/{id}`, `POST /ressource`, `PUT /ressource/{id}`, `DELETE /ressource/{id}`. Elles retournent respectivement `200`, `200/404`, `201/400`, `200/400/404`, et `200/404`.

| Ressource | Route de collection | Champs de création principaux |
|---|---|---|
| Sessions | `/training-sessions` | `formation_id`, `date_debut`, `date_fin?`, `lieu?`, `capacite?`, `statut?` |
| Inscriptions | `/enrollments` | `utilisateur_id`, `training_session_id`, `date_inscription`, `statut?` |
| Quiz | `/quizzes` | `formation_id`, `titre`, `description?`, `duree?`, `score_requis?`, `statut?` |
| Questions | `/quiz-questions` | `quiz_id`, `question`, `type` (`multiple_choice`, `vrai_faux`, `reponse_libre`), `ordre?` |
| Réponses | `/quiz-answers` | `question_id`, `answer`, `est_correcte`, `ordre?` |
| Résultats | `/quiz-results` | `quiz_id`, `utilisateur_id`, `score`, `score_max`, `reussi`, `date_passage?` |

Filtres supportés : `formation_id` pour sessions et quiz; `training_session_id`, `utilisateur_id`, `statut` pour inscriptions; `quiz_id`, `type` pour questions; `question_id`, `est_correcte` pour réponses; `quiz_id`, `utilisateur_id`, `reussi` pour résultats.

| Méthode | Route | Corps | Réponse |
|---|---|---|---|
| POST | `/quiz-attempts` | voir exemple ci-dessous | `201` résultat calculé; `400`, `404` |
| GET | `/learning-tasks` | `utilisateur_id` requis | `200` tâches déclenchées par inscription ou quiz |
| GET | `/performance-events` | `utilisateur_id` requis | `200` événements Formation disponibles pour Performance |

## Exemples

Créer une compétence :

```http
POST /api/competences
Content-Type: application/json

{ "nom": "NestJS", "categorie": "Backend", "niveau": "Intermédiaire" }
```

```json
{ "id": "b38f…", "nom": "NestJS", "categorie": "Backend", "niveau": "Intermédiaire" }
```

Soumettre une tentative — une seule réponse est envoyée pour chaque question à choix ou vrai/faux :

```json
POST /api/quiz-attempts
{
  "quiz_id": "74bf8864-2c59-4fec-a11b-d6d9773f0e70",
  "utilisateur_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "reponses": [
    { "question_id": "qcm-uuid", "answer_ids": ["answer-uuid"] },
    { "question_id": "texte-uuid", "texte_libre": "const" }
  ]
}
```

```json
{
  "score": 100,
  "score_max": 100,
  "reussi": true,
  "total_questions": 5,
  "bonnes_reponses": 5,
  "detail": [{ "question_id": "qcm-uuid", "correcte": true, "reponses_attendues": ["answer-uuid"], "reponses_soumises": ["answer-uuid"] }]
}
```
