-- ============================================================
-- Migration : table de liaison formation_competences
-- Complète la sous-tâche "génération d'embeddings à partir des
-- descriptions ET des compétences requises" (tâche #4011)
-- ============================================================

CREATE TABLE formation_competences (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formation_id   UUID NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
    competence_id  UUID NOT NULL REFERENCES competences(id) ON DELETE CASCADE,
    niveau_vise    SMALLINT REFERENCES skill_levels(id),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_formation_competence UNIQUE (formation_id, competence_id)
);

CREATE INDEX idx_formation_competences_formation  ON formation_competences (formation_id);
CREATE INDEX idx_formation_competences_competence ON formation_competences (competence_id);
