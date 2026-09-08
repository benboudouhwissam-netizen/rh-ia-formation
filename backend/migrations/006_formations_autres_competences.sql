-- ============================================================
-- Formations supplémentaires couvrant les compétences restantes
-- (C++, C#, NestJS, React, Spring Boot, Docker, Kubernetes)
-- ============================================================

INSERT INTO formations (id, titre, description, categorie, niveau, duree, statut)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Développement backend avec NestJS',
   'Concevoir des API robustes et modulaires avec NestJS, TypeORM et une architecture propre.',
   'Backend', 'Intermédiaire', 100, 'active'),

  ('22222222-2222-2222-2222-222222222222', 'Interfaces modernes avec React',
   'Construire des interfaces utilisateurs réactives et performantes avec React et les hooks.',
   'Frontend', 'Débutant', 90, 'active'),

  ('33333333-3333-3333-3333-333333333333', 'Conteneurisation avec Docker',
   'Créer, gérer et déployer des applications conteneurisées avec Docker et Docker Compose.',
   'DevOps', 'Intermédiaire', 80, 'active'),

  ('44444444-4444-4444-4444-444444444444', 'Orchestration avec Kubernetes',
   'Déployer, scaler et superviser des applications conteneurisées à grande échelle avec Kubernetes.',
   'DevOps', 'Avancé', 120, 'active'),

  ('55555555-5555-5555-5555-555555555555', 'Applications backend avec C#',
   'Développer des applications robustes en C# pour des environnements desktop, web et mobiles.',
   'Backend', 'Intermédiaire', 100, 'active'),

  ('66666666-6666-6666-6666-666666666666', 'Microservices avec Spring Boot',
   'Concevoir des microservices Java performants et sécurisés avec Spring Boot.',
   'Backend', 'Avancé', 110, 'active'),

  ('77777777-7777-7777-7777-777777777777', 'Programmation avancée en C++',
   'Maîtriser la programmation orientée objet et la gestion mémoire avancée en C++.',
   'Programmation', 'Avancé', 130, 'active')
ON CONFLICT (id) DO NOTHING;

-- Lien formation <-> compétence (formation_competences)
INSERT INTO formation_competences (formation_id, competence_id, niveau_vise)
VALUES
  ('11111111-1111-1111-1111-111111111111', '86015699-545f-491e-94b7-25c6c52a81d7', 4), -- NestJS
  ('22222222-2222-2222-2222-222222222222', '35e471dd-45bd-419c-9d91-1578a6f250fe', 3), -- React
  ('33333333-3333-3333-3333-333333333333', 'bd569165-a06e-4f68-b9d1-42d221d334d0', 3), -- Docker
  ('44444444-4444-4444-4444-444444444444', '6c730377-7156-41f3-9047-749376f18b5c', 5), -- Kubernetes
  ('55555555-5555-5555-5555-555555555555', '00359573-2e94-49b4-897b-4f1b8c94a043', 4), -- C#
  ('66666666-6666-6666-6666-666666666666', '0c35fa78-f5f0-48d2-a22f-cda866ce02f1', 5), -- Spring Boot
  ('77777777-7777-7777-7777-777777777777', 'aa3615b8-3b8a-448e-8d9b-be3122d7d69d', 4)  -- C++
ON CONFLICT (formation_id, competence_id) DO NOTHING;
