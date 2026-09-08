-- Projection locale des événements Formation vers le module Performance.
CREATE TABLE IF NOT EXISTS performance_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference_id UUID,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_performance_events_utilisateur_created
    ON performance_events (utilisateur_id, created_at DESC);
