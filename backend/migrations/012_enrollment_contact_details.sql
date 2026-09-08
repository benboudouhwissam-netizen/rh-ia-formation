-- Informations saisies lors de l'inscription à une session de formation.
-- Les colonnes restent optionnelles afin de préserver les inscriptions existantes.
ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS nom_complet VARCHAR(150),
  ADD COLUMN IF NOT EXISTS email_professionnel VARCHAR(254);
