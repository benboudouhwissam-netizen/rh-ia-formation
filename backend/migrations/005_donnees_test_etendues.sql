-- ============================================================
-- Données de test étendues : plusieurs utilisateurs, postes,
-- et compétences pour valider matrice / experts / écarts
-- ============================================================

-- Rappel des compétences déjà en base (pour référence) :
-- C++          aa3615b8-3b8a-448e-8d9b-be3122d7d69d
-- C#           00359573-2e94-49b4-897b-4f1b8c94a043
-- NestJS       86015699-545f-491e-94b7-25c6c52a81d7
-- Python       6c898c0d-0783-4f8b-a5a1-492a9c7bcd58
-- React        35e471dd-45bd-419c-9d91-1578a6f250fe
-- Spring Boot  0c35fa78-f5f0-48d2-a22f-cda866ce02f1
-- Docker       bd569165-a06e-4f68-b9d1-42d221d334d0
-- Kubernetes   6c730377-7156-41f3-9047-749376f18b5c

-- ------------------------------------------------------------
-- Nouveaux utilisateurs de test (en plus de aaaaaaaa... déjà utilisé)
-- ------------------------------------------------------------
-- Marie   : cccccccc-cccc-cccc-cccc-cccccccccccc
-- Youssef : dddddddd-dddd-dddd-dddd-dddddddddddd

-- ------------------------------------------------------------
-- Nouveaux postes de test (en plus de bbbbbbbb... déjà utilisé pour Python)
-- ------------------------------------------------------------
-- Poste Backend Java/Spring : eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee
-- Poste DevOps               : ffffffff-ffff-ffff-ffff-ffffffffffff

-- ------------------------------------------------------------
-- 1. Compétences évaluées par collaborateur (employee_competences)
-- ------------------------------------------------------------

INSERT INTO employee_competences (utilisateur_id, competence_id, niveau, source, date_evaluation)
VALUES
  -- aaaaaaaa (déjà Python niveau 2 en base) — on complète son profil
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aa3615b8-3b8a-448e-8d9b-be3122d7d69d', 1, 'auto_evalue', now()), -- C++
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '86015699-545f-491e-94b7-25c6c52a81d7', 3, 'manager', now()),     -- NestJS
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bd569165-a06e-4f68-b9d1-42d221d334d0', 2, 'auto_evalue', now()), -- Docker

  -- Marie
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '35e471dd-45bd-419c-9d91-1578a6f250fe', 4, 'certifie', now()),    -- React
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '00359573-2e94-49b4-897b-4f1b8c94a043', 3, 'manager', now()),     -- C#
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '6c730377-7156-41f3-9047-749376f18b5c', 1, 'auto_evalue', now()), -- Kubernetes
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '0c35fa78-f5f0-48d2-a22f-cda866ce02f1', 2, 'auto_evalue', now()), -- Spring Boot

  -- Youssef
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '6c898c0d-0783-4f8b-a5a1-492a9c7bcd58', 4, 'certifie', now()),    -- Python
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'bd569165-a06e-4f68-b9d1-42d221d334d0', 4, 'manager', now()),     -- Docker
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '6c730377-7156-41f3-9047-749376f18b5c', 3, 'auto_evalue', now()), -- Kubernetes
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '86015699-545f-491e-94b7-25c6c52a81d7', 2, 'auto_evalue', now())  -- NestJS
ON CONFLICT (utilisateur_id, competence_id) DO NOTHING;

-- ------------------------------------------------------------
-- 2. Compétences requises par poste (competence_matrices)
-- ------------------------------------------------------------

INSERT INTO competence_matrices (poste_id, competence_id, niveau_requis)
VALUES
  -- Poste existant (bbbbbbbb) : on ajoute d'autres exigences en plus de Python
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '86015699-545f-491e-94b7-25c6c52a81d7', 4), -- NestJS
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bd569165-a06e-4f68-b9d1-42d221d334d0', 3), -- Docker

  -- Poste Backend Java/Spring (eeeeeeee)
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '00359573-2e94-49b4-897b-4f1b8c94a043', 4), -- C#
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '0c35fa78-f5f0-48d2-a22f-cda866ce02f1', 5), -- Spring Boot
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bd569165-a06e-4f68-b9d1-42d221d334d0', 3), -- Docker

  -- Poste DevOps (ffffffff)
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'bd569165-a06e-4f68-b9d1-42d221d334d0', 5), -- Docker
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '6c730377-7156-41f3-9047-749376f18b5c', 5), -- Kubernetes
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '86015699-545f-491e-94b7-25c6c52a81d7', 2)  -- NestJS
ON CONFLICT (poste_id, competence_id) DO NOTHING;
