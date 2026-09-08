-- Tâche de suivi créée lors d'une inscription ou d'un résultat de quiz.
CREATE TABLE IF NOT EXISTS learning_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    statut VARCHAR(50) NOT NULL DEFAULT 'a_faire',
    reference_id UUID,
    message TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learning_tasks_utilisateur_created
    ON learning_tasks (utilisateur_id, created_at DESC);
