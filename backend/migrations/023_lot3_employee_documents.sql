-- Tables prioritaires du dossier employé Lot 3.
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employee_accounts(id) ON DELETE CASCADE,
  type VARCHAR(40) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'actif',
  start_date DATE NOT NULL,
  end_date DATE,
  job_title VARCHAR(120),
  salary NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS diplomas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employee_accounts(id) ON DELETE CASCADE,
  title VARCHAR(180) NOT NULL,
  institution VARCHAR(180),
  field VARCHAR(120),
  year INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employee_accounts(id) ON DELETE CASCADE,
  category VARCHAR(60) NOT NULL,
  title VARCHAR(180) NOT NULL,
  storage_key TEXT,
  mime_type VARCHAR(120),
  size_bytes BIGINT,
  ocr_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contracts_employee ON contracts(employee_id);
CREATE INDEX IF NOT EXISTS idx_diplomas_employee ON diplomas(employee_id);
CREATE INDEX IF NOT EXISTS idx_documents_employee ON documents(employee_id);
