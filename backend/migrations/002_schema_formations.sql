-- ============================================================
-- Migration : Schéma PostgreSQL Formation & Évaluation
-- Tâche #4009 — Lot 8 / Module Formation IA
-- ============================================================

-- ============================================================
-- 1. TABLE formations
-- ============================================================

CREATE TABLE formations (
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
-- 2. TABLE training_sessions
-- ============================================================

CREATE TABLE training_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    formation_id UUID NOT NULL
        REFERENCES formations(id)
        ON DELETE CASCADE,

    date_debut TIMESTAMP NOT NULL,

    date_fin TIMESTAMP,

    lieu VARCHAR(150),

    capacite INTEGER,

    statut VARCHAR(50),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- 3. TABLE enrollments
-- ============================================================

CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    utilisateur_id UUID NOT NULL,

    training_session_id UUID NOT NULL
        REFERENCES training_sessions(id)
        ON DELETE CASCADE,

    date_inscription TIMESTAMP NOT NULL,

    statut VARCHAR(50),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_enrollment_utilisateur_session
        UNIQUE (utilisateur_id, training_session_id)
);


-- ============================================================
-- 4. TABLE quiz
-- ============================================================

CREATE TABLE quiz (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    formation_id UUID NOT NULL
        REFERENCES formations(id)
        ON DELETE CASCADE,

    titre VARCHAR(150) NOT NULL,

    description TEXT,

    duree INTEGER,

    score_requis INTEGER,

    statut VARCHAR(50),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- 5. TABLE quiz_questions
-- ============================================================

CREATE TABLE quiz_questions (
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


-- ============================================================
-- 6. TABLE quiz_answers
-- ============================================================

CREATE TABLE quiz_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    question_id UUID NOT NULL
        REFERENCES quiz_questions(id)
        ON DELETE CASCADE,

    answer TEXT NOT NULL,

    est_correcte BOOLEAN NOT NULL DEFAULT false,

    ordre INTEGER,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- 7. TABLE quiz_results
-- ============================================================

CREATE TABLE quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    quiz_id UUID NOT NULL
        REFERENCES quiz(id)
        ON DELETE CASCADE,

    utilisateur_id UUID NOT NULL,

    score INTEGER,

    score_max INTEGER,

    reussi BOOLEAN NOT NULL DEFAULT false,

    date_passage TIMESTAMP,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- 8. TABLE link_certifications_formations
-- ============================================================
-- La table certifications existe déjà dans 001_schema_competences.sql

CREATE TABLE link_certifications_formations (
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


-- ============================================================
-- 9. INDEX
-- ============================================================

CREATE INDEX idx_training_sessions_formation
    ON training_sessions (formation_id);

CREATE INDEX idx_training_sessions_date_debut
    ON training_sessions (date_debut);

CREATE INDEX idx_enrollments_utilisateur
    ON enrollments (utilisateur_id);

CREATE INDEX idx_enrollments_training_session
    ON enrollments (training_session_id);

CREATE INDEX idx_quiz_formation
    ON quiz (formation_id);

CREATE INDEX idx_quiz_questions_quiz
    ON quiz_questions (quiz_id);

CREATE INDEX idx_quiz_questions_ordre
    ON quiz_questions (quiz_id, ordre);

CREATE INDEX idx_quiz_answers_question
    ON quiz_answers (question_id);

CREATE INDEX idx_quiz_results_quiz
    ON quiz_results (quiz_id);

CREATE INDEX idx_quiz_results_utilisateur
    ON quiz_results (utilisateur_id);

CREATE INDEX idx_link_certifications_formations_certification
    ON link_certifications_formations (certification_id);

CREATE INDEX idx_link_certifications_formations_formation
    ON link_certifications_formations (formation_id);