# Schéma ER PostgreSQL

```mermaid
erDiagram
  SKILL_LEVELS ||--o{ EMPLOYEE_COMPETENCES : "niveau"
  SKILL_LEVELS ||--o{ COMPETENCE_MATRICES : "niveau requis"
  COMPETENCES ||--o{ EMPLOYEE_COMPETENCES : "est évaluée"
  COMPETENCES ||--o{ COMPETENCE_MATRICES : "est exigée"
  COMPETENCES ||--o{ CERTIFICATIONS : "est certifiée"
  CERTIFICATIONS ||--o{ LINK_CERTIFICATIONS_FORMATIONS : "associe"
  FORMATIONS ||--o{ LINK_CERTIFICATIONS_FORMATIONS : "associe"
  FORMATIONS ||--o{ TRAINING_SESSIONS : "planifie"
  TRAINING_SESSIONS ||--o{ ENROLLMENTS : "reçoit"
  FORMATIONS ||--o{ QUIZ : "évalue"
  QUIZ ||--o{ QUIZ_QUESTIONS : "contient"
  QUIZ_QUESTIONS ||--o{ QUIZ_ANSWERS : "propose"
  QUIZ ||--o{ QUIZ_RESULTS : "produit"
  LEARNING_TASKS }o--|| ENROLLMENTS : "déclenchée par"
  PERFORMANCE_EVENTS }o--|| QUIZ_RESULTS : "projette"

  SKILL_LEVELS { smallint id PK varchar libelle }
  COMPETENCES { uuid id PK varchar nom vector_1536 embedding }
  EMPLOYEE_COMPETENCES { uuid id PK uuid utilisateur_id uuid competence_id FK smallint niveau FK }
  COMPETENCE_MATRICES { uuid id PK uuid poste_id uuid competence_id FK smallint niveau_requis FK }
  CERTIFICATIONS { uuid id PK uuid utilisateur_id uuid competence_id FK }
  FORMATIONS { uuid id PK varchar titre vector_1536 embedding }
  TRAINING_SESSIONS { uuid id PK uuid formation_id FK timestamptz date_debut }
  ENROLLMENTS { uuid id PK uuid utilisateur_id uuid training_session_id FK }
  QUIZ { uuid id PK uuid formation_id FK varchar titre }
  QUIZ_QUESTIONS { uuid id PK uuid quiz_id FK varchar type int ordre }
  QUIZ_ANSWERS { uuid id PK uuid question_id FK boolean est_correcte }
  QUIZ_RESULTS { uuid id PK uuid quiz_id FK uuid utilisateur_id }
  LEARNING_TASKS { uuid id PK uuid utilisateur_id uuid reference_id varchar type varchar statut jsonb payload }
  PERFORMANCE_EVENTS { uuid id PK uuid utilisateur_id uuid reference_id varchar type jsonb payload }
  LINK_CERTIFICATIONS_FORMATIONS { uuid id PK uuid certification_id FK uuid formation_id FK }
```

## Index et contraintes

- `competences.embedding vector(1536)` et `formations.embedding vector(1536)` sont destinés à pgvector. `idx_competences_embedding` est un index `ivfflat` avec `vector_cosine_ops` et `lists = 100`; il accélère les recherches de similarité cosinus.
- `employee_competences(utilisateur_id, competence_id)` et `competence_matrices(poste_id, competence_id)` sont uniques. Ils empêchent le doublonnage d'une évaluation ou d'une exigence de poste.
- Les index ciblent les clés de jointure et filtres : `employee_competences.utilisateur_id`, `employee_competences.competence_id`, `competence_matrices.poste_id`, `competence_matrices.competence_id`, les clés de certifications, sessions, inscriptions, quiz, questions, réponses et résultats.
- Les relations qui dépendent fonctionnellement d'une compétence, formation, session, quiz ou question utilisent `ON DELETE CASCADE`.

Les migrations de référence sont `migrations/001_schema_competences.sql`, `002_schema_formations.sql` et `migration_quiz_complete.sql`.
