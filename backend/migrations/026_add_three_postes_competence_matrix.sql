-- Complète les six postes disponibles dans l'inscription et le profil.
INSERT INTO competence_matrices (poste_id, competence_id, niveau_requis)
VALUES
  -- Développeur frontend
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '35e471dd-45bd-419c-9d91-1578a6f250fe', 3),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00359573-2e94-49b4-897b-4f1b8c94a043', 2),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bd569165-a06e-4f68-b9d1-42d221d334d0', 2),
  -- Architecte cloud
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '6c730377-7156-41f3-9047-749376f18b5c', 4),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '0c35fa78-f5f0-48d2-a22f-cda866ce02f1', 3),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'bd569165-a06e-4f68-b9d1-42d221d334d0', 3),
  -- Chef de projet formation
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '6c898c0d-0783-4f8b-a5a1-492a9c7bcd58', 3),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '35e471dd-45bd-419c-9d91-1578a6f250fe', 2),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '86015699-545f-491e-94b7-25c6c52a81d7', 3)
ON CONFLICT (poste_id, competence_id) DO NOTHING;
