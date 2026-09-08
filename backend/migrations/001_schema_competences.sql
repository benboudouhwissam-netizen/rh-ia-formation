-- ============================================================
-- Migration : Modéliser le schéma PostgreSQL des compétences
-- Tâche #4007 — Lot 8 / Module Gestion des compétences
-- ============================================================

-- Extension pgvector (déjà activée via init-db, mais on s'assure)
CREATE EXTENSION IF NOT EXISTS vector;

-- ------------------------------------------------------------
-- Sous-tâche 1 : tables competences, skill_levels, certifications
-- ------------------------------------------------------------

-- Référentiel des niveaux (1 = Notion, 5 = Expert, etc.)
CREATE TABLE skill_levels (
    id          SMALLINT PRIMARY KEY,
    libelle     VARCHAR(50) NOT NULL,
    description TEXT
);

INSERT INTO skill_levels (id, libelle, description) VALUES
    (1, 'Notion',      'Connaissance théorique de base'),
    (2, 'Débutant',    'Capable d''appliquer avec accompagnement'),
    (3, 'Intermédiaire','Autonome sur les cas courants'),
    (4, 'Avancé',      'Autonome sur les cas complexes'),
    (5, 'Expert',      'Référent, capable de former les autres');

-- Table principale des compétences
CREATE TABLE competences (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom         VARCHAR(150) NOT NULL,
    description TEXT,
    categorie   VARCHAR(80),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Certifications liées à une compétence
CREATE TABLE certifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id      UUID NOT NULL,
    competence_id       UUID NOT NULL REFERENCES competences(id) ON DELETE CASCADE,
    nom_certification   VARCHAR(150) NOT NULL,
    organisme           VARCHAR(150),
    date_obtention      DATE NOT NULL,
    date_expiration     DATE,
    fichier_id          UUID
);

-- ------------------------------------------------------------
-- Sous-tâche 2 : colonne embedding (pgvector) sur competences
-- ------------------------------------------------------------

ALTER TABLE competences
    ADD COLUMN embedding vector(1536);

-- Index de similarité approximative (ivfflat) pour les recherches sémantiques
-- À créer une fois qu'il y a des données (l'index ivfflat a besoin d'un minimum de lignes)
-- lists = 100 est un point de départ raisonnable pour un volume modéré de compétences
CREATE INDEX idx_competences_embedding
    ON competences
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- ------------------------------------------------------------
-- Sous-tâche 3 : tables de jonction + index
-- ------------------------------------------------------------

-- Compétences évaluées par collaborateur (jonction employee <-> competences)
CREATE TABLE employee_competences (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id    UUID NOT NULL,
    competence_id     UUID NOT NULL REFERENCES competences(id) ON DELETE CASCADE,
    niveau            SMALLINT NOT NULL REFERENCES skill_levels(id),
    source            VARCHAR(30) NOT NULL DEFAULT 'auto_evalue',
        -- valeurs attendues : auto_evalue | manager | certifie | ia_estime
    date_evaluation   TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_employee_competence UNIQUE (utilisateur_id, competence_id)
);

-- Matrices de compétences (compétences requises par poste, base des écarts)
CREATE TABLE competence_matrices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poste_id        UUID NOT NULL,
    competence_id   UUID NOT NULL REFERENCES competences(id) ON DELETE CASCADE,
    niveau_requis   SMALLINT NOT NULL REFERENCES skill_levels(id),

    CONSTRAINT uq_poste_competence UNIQUE (poste_id, competence_id)
);

-- Index pour accélérer les jointures et filtres fréquents
CREATE INDEX idx_employee_competences_utilisateur ON employee_competences (utilisateur_id);
CREATE INDEX idx_employee_competences_competence  ON employee_competences (competence_id);
CREATE INDEX idx_competence_matrices_poste         ON competence_matrices (poste_id);
CREATE INDEX idx_competence_matrices_competence     ON competence_matrices (competence_id);
CREATE INDEX idx_certifications_utilisateur         ON certifications (utilisateur_id);
CREATE INDEX idx_certifications_competence          ON certifications (competence_id);


-- ============================================================
-- Tâche 3 — Formation & Évaluations
-- ============================================================

-- ============================================================
-- Table : formations
-- ============================================================

CREATE TABLE IF NOT EXISTS formations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    titre VARCHAR(150) NOT NULL,

    description TEXT,

    categorie VARCHAR(80),

    duree INTEGER,

    statut VARCHAR(50),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Table : training_sessions
-- ============================================================

CREATE TABLE IF NOT EXISTS training_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    formation_id UUID NOT NULL
        REFERENCES formations(id)
        ON DELETE CASCADE,

    date_debut TIMESTAMPTZ NOT NULL,

    date_fin TIMESTAMPTZ,

    lieu VARCHAR(150),

    capacite INTEGER,

    statut VARCHAR(50),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_training_sessions_formation
ON training_sessions (formation_id);

CREATE INDEX IF NOT EXISTS idx_training_sessions_date_debut
ON training_sessions (date_debut);

-- ============================================================
-- Table : enrollments
-- ============================================================

CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    utilisateur_id UUID NOT NULL,

    training_session_id UUID NOT NULL
        REFERENCES training_sessions(id)
        ON DELETE CASCADE,

    date_inscription TIMESTAMPTZ NOT NULL,

    statut VARCHAR(50),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_enrollment_user_session
        UNIQUE (utilisateur_id, training_session_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_utilisateur
ON enrollments (utilisateur_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_training_session
ON enrollments (training_session_id);

-- ============================================================
-- Table : quiz
-- ============================================================

CREATE TABLE IF NOT EXISTS quiz (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    formation_id UUID NOT NULL
        REFERENCES formations(id)
        ON DELETE CASCADE,

    titre VARCHAR(150) NOT NULL,

    description TEXT,

    duree INTEGER,

    seuil_reussite INTEGER,

    statut VARCHAR(50),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_formation
ON quiz (formation_id);

-- ============================================================
-- Table : quiz_questions
-- ============================================================

CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    quiz_id UUID NOT NULL
        REFERENCES quiz(id)
        ON DELETE CASCADE,

    question TEXT NOT NULL,

    type VARCHAR(50),

    ordre INTEGER,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz
ON quiz_questions (quiz_id);

-- ============================================================
-- Table : quiz_answers
-- ============================================================

CREATE TABLE IF NOT EXISTS quiz_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    question_id UUID NOT NULL
        REFERENCES quiz_questions(id)
        ON DELETE CASCADE,

    reponse TEXT NOT NULL,

    est_correcte BOOLEAN NOT NULL DEFAULT false,

    ordre INTEGER,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_answers_question
ON quiz_answers (question_id);

-- ============================================================
-- Table : quiz_results
-- ============================================================

CREATE TABLE IF NOT EXISTS quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    quiz_id UUID NOT NULL
        REFERENCES quiz(id)
        ON DELETE CASCADE,

    utilisateur_id UUID NOT NULL,

    score INTEGER,

    score_max INTEGER,

    reussi BOOLEAN NOT NULL DEFAULT false,

    date_passage TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz
ON quiz_results (quiz_id);

CREATE INDEX IF NOT EXISTS idx_quiz_results_utilisateur
ON quiz_results (utilisateur_id);

-- ============================================================
-- Table : link_certifications_formations
-- ============================================================

CREATE TABLE IF NOT EXISTS link_certifications_formations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    certification_id UUID NOT NULL
        REFERENCES certifications(id)
        ON DELETE CASCADE,

    formation_id UUID NOT NULL
        REFERENCES formations(id)
        ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_certification_formation
        UNIQUE (certification_id, formation_id)
);

CREATE INDEX IF NOT EXISTS idx_link_certifications_certification
ON link_certifications_formations (certification_id);

CREATE INDEX IF NOT EXISTS idx_link_certifications_formation
ON link_certifications_formations (formation_id);