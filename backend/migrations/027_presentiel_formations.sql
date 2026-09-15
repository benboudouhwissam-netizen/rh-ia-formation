-- Cinq nouvelles formations en présentiel, avec sessions, salles et capacités.
ALTER TABLE formations
  ADD COLUMN IF NOT EXISTS modalite VARCHAR(30) NOT NULL DEFAULT 'e_learning';

INSERT INTO formations (id, titre, description, categorie, niveau, duree, statut, modalite)
VALUES
  ('81000000-0000-0000-0000-000000000001', 'Cybersécurité et protection des données', 'Identifier les menaces, sécuriser les postes et appliquer les bonnes pratiques de protection des données.', 'Cybersécurité', 'Intermédiaire', 420, 'active', 'presentiel'),
  ('81000000-0000-0000-0000-000000000002', 'Fondamentaux des réseaux', 'Comprendre TCP/IP, le routage, les VLAN et le diagnostic des incidents réseau.', 'Réseaux', 'Débutant', 360, 'active', 'presentiel'),
  ('81000000-0000-0000-0000-000000000003', 'Intelligence artificielle appliquée', 'Découvrir les usages de l’IA, préparer les données et intégrer un modèle dans un projet métier.', 'Intelligence artificielle', 'Intermédiaire', 420, 'active', 'presentiel'),
  ('81000000-0000-0000-0000-000000000004', 'Bases de données et SQL', 'Modéliser une base relationnelle, écrire des requêtes SQL fiables et optimiser les performances.', 'Bases de données', 'Débutant', 360, 'active', 'presentiel'),
  ('81000000-0000-0000-0000-000000000005', 'Gestion de projet agile', 'Planifier un projet, animer les rituels agiles et suivre la livraison avec Scrum.', 'Gestion de projet', 'Intermédiaire', 300, 'active', 'presentiel')
ON CONFLICT (id) DO UPDATE SET
  titre = EXCLUDED.titre,
  description = EXCLUDED.description,
  categorie = EXCLUDED.categorie,
  niveau = EXCLUDED.niveau,
  duree = EXCLUDED.duree,
  statut = EXCLUDED.statut,
  modalite = EXCLUDED.modalite;

-- Compétences déjà présentes dans le référentiel : les formations alimentent
-- donc automatiquement la matrice et les écarts après certification.
INSERT INTO formation_competences (formation_id, competence_id, niveau_vise)
VALUES
  ('81000000-0000-0000-0000-000000000001', '6c898c0d-0783-4f8b-a5a1-492a9c7bcd58', 4),
  ('81000000-0000-0000-0000-000000000002', 'bd569165-a06e-4f68-b9d1-42d221d334d0', 3),
  ('81000000-0000-0000-0000-000000000003', '86015699-545f-491e-94b7-25c6c52a81d7', 3),
  ('81000000-0000-0000-0000-000000000004', '0c35fa78-f5f0-48d2-a22f-cda866ce02f1', 3),
  ('81000000-0000-0000-0000-000000000005', '6c898c0d-0783-4f8b-a5a1-492a9c7bcd58', 3)
ON CONFLICT (formation_id, competence_id) DO UPDATE SET niveau_vise = EXCLUDED.niveau_vise;

INSERT INTO training_sessions (formation_id, date_debut, date_fin, lieu, capacite, statut)
SELECT v.formation_id, v.date_debut::timestamptz, (v.date_debut::date + 1)::timestamptz,
       v.lieu, v.capacite, 'ouverte'
FROM (VALUES
  ('81000000-0000-0000-0000-000000000001'::uuid, CURRENT_DATE + 14, 'Salle Atlas', 16),
  ('81000000-0000-0000-0000-000000000002'::uuid, CURRENT_DATE + 21, 'Salle Rif', 20),
  ('81000000-0000-0000-0000-000000000003'::uuid, CURRENT_DATE + 28, 'Salle AI', 14),
  ('81000000-0000-0000-0000-000000000004'::uuid, CURRENT_DATE + 35, 'Salle Data', 18),
  ('81000000-0000-0000-0000-000000000005'::uuid, CURRENT_DATE + 42, 'Salle Agilité', 22)
) AS v(formation_id, date_debut, lieu, capacite)
WHERE NOT EXISTS (
  SELECT 1 FROM training_sessions s
  WHERE s.formation_id = v.formation_id
    AND s.date_debut::date = v.date_debut
);

-- Un quiz de validation minimal est créé pour chaque nouveau parcours.
INSERT INTO quiz (formation_id, titre, description, duree, score_requis, statut)
SELECT f.id, 'Évaluation — ' || f.titre, 'Quiz de validation de la formation.', 20, 70, 'active'
FROM formations f
WHERE f.id IN (
  '81000000-0000-0000-0000-000000000001', '81000000-0000-0000-0000-000000000002',
  '81000000-0000-0000-0000-000000000003', '81000000-0000-0000-0000-000000000004',
  '81000000-0000-0000-0000-000000000005'
)
AND NOT EXISTS (SELECT 1 FROM quiz q WHERE q.formation_id = f.id);

INSERT INTO quiz_questions (quiz_id, question, type, ordre)
SELECT q.id, 'Quel est le principal objectif de cette formation ?', 'choix_unique', 1
FROM quiz q
JOIN formations f ON f.id = q.formation_id
WHERE f.id::text LIKE '81000000-0000-0000-0000-00000000000%'
  AND NOT EXISTS (SELECT 1 FROM quiz_questions qq WHERE qq.quiz_id = q.id);

INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT qq.id, a.answer, a.est_correcte, a.ordre
FROM quiz_questions qq
JOIN quiz q ON q.id = qq.quiz_id
CROSS JOIN (VALUES
  ('Appliquer les bonnes pratiques vues pendant la formation', true, 1),
  ('Ignorer les règles de sécurité', false, 2),
  ('Supprimer les données de l’entreprise', false, 3)
) AS a(answer, est_correcte, ordre)
WHERE q.formation_id::text LIKE '81000000-0000-0000-0000-00000000000%'
  AND NOT EXISTS (SELECT 1 FROM quiz_answers qa WHERE qa.question_id = qq.id);
