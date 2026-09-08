-- Enrichissement du dossier employé (Lot 3).
ALTER TABLE employee_accounts ADD COLUMN IF NOT EXISTS matricule VARCHAR(50);
ALTER TABLE employee_accounts ADD COLUMN IF NOT EXISTS first_name VARCHAR(80);
ALTER TABLE employee_accounts ADD COLUMN IF NOT EXISTS last_name VARCHAR(80);
ALTER TABLE employee_accounts ADD COLUMN IF NOT EXISTS phone VARCHAR(30);
ALTER TABLE employee_accounts ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE employee_accounts ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE employee_accounts ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE employee_accounts ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);
ALTER TABLE employee_accounts ADD COLUMN IF NOT EXISTS country VARCHAR(80);
ALTER TABLE employee_accounts ADD COLUMN IF NOT EXISTS hire_date DATE;
ALTER TABLE employee_accounts ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'actif';
ALTER TABLE employee_accounts ADD COLUMN IF NOT EXISTS job_title VARCHAR(120);

CREATE UNIQUE INDEX IF NOT EXISTS uq_employee_accounts_matricule
  ON employee_accounts (matricule)
  WHERE matricule IS NOT NULL;
