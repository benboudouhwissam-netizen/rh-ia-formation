-- Comptes individuels des collaborateurs pour l'espace Formation.
CREATE TABLE IF NOT EXISTS employee_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom_complet VARCHAR(150) NOT NULL,
    email_professionnel VARCHAR(254) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    poste_id UUID NOT NULL DEFAULT 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employee_auth_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employee_accounts(id) ON DELETE CASCADE,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_employee_auth_sessions_employee
    ON employee_auth_sessions (employee_id);
