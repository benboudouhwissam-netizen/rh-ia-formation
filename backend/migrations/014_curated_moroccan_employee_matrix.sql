-- Profils affichés dans l'espace collaborateur : noms présentés côté frontend
-- (Amina El Idrissi, Youssef Alaoui, Salma Benjelloun, Imane Berrada,
-- Farid El Mansouri). Chaque profil possède au minimum quatre compétences.

INSERT INTO employee_competences (utilisateur_id, competence_id, niveau, source, date_evaluation)
VALUES
  -- Amina El Idrissi : Responsable formation
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '6c898c0d-0783-4f8b-a5a1-492a9c7bcd58', 2, 'manager', now()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aa3615b8-3b8a-448e-8d9b-be3122d7d69d', 1, 'auto_evalue', now()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '86015699-545f-491e-94b7-25c6c52a81d7', 3, 'manager', now()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bd569165-a06e-4f68-b9d1-42d221d334d0', 2, 'auto_evalue', now()),

  -- Youssef Alaoui : Développeur backend
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '35e471dd-45bd-419c-9d91-1578a6f250fe', 4, 'certifie', now()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '00359573-2e94-49b4-897b-4f1b8c94a043', 3, 'manager', now()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '6c730377-7156-41f3-9047-749376f18b5c', 1, 'auto_evalue', now()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '0c35fa78-f5f0-48d2-a22f-cda866ce02f1', 2, 'auto_evalue', now()),

  -- Salma Benjelloun : DevOps Lead
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '6c898c0d-0783-4f8b-a5a1-492a9c7bcd58', 4, 'certifie', now()),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'bd569165-a06e-4f68-b9d1-42d221d334d0', 4, 'manager', now()),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '6c730377-7156-41f3-9047-749376f18b5c', 3, 'auto_evalue', now()),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '86015699-545f-491e-94b7-25c6c52a81d7', 2, 'auto_evalue', now()),

  -- Imane Berrada : Analyste RH
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '6c898c0d-0783-4f8b-a5a1-492a9c7bcd58', 3, 'manager', now()),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '35e471dd-45bd-419c-9d91-1578a6f250fe', 2, 'auto_evalue', now()),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '00359573-2e94-49b4-897b-4f1b8c94a043', 2, 'auto_evalue', now()),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '86015699-545f-491e-94b7-25c6c52a81d7', 1, 'auto_evalue', now()),

  -- Farid El Mansouri : Ingénieur logiciel
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'aa3615b8-3b8a-448e-8d9b-be3122d7d69d', 4, 'certifie', now()),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '00359573-2e94-49b4-897b-4f1b8c94a043', 4, 'manager', now()),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '86015699-545f-491e-94b7-25c6c52a81d7', 3, 'auto_evalue', now()),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '35e471dd-45bd-419c-9d91-1578a6f250fe', 3, 'auto_evalue', now())
ON CONFLICT (utilisateur_id, competence_id) DO UPDATE
SET niveau = EXCLUDED.niveau,
    source = EXCLUDED.source,
    date_evaluation = EXCLUDED.date_evaluation;
