-- Rend le quiz « Évaluation des compétences professionnelles » passable.
-- Chaque insertion est conditionnelle afin que cette migration soit relançable.
WITH answers(question_id, answer, est_correcte, ordre) AS (
  VALUES
    ('1e5b689a-58f4-4ad7-84c9-2ed2fdea1bb8'::uuid, 'Aligner les compétences des collaborateurs avec les besoins de l''entreprise', true, 1),
    ('1e5b689a-58f4-4ad7-84c9-2ed2fdea1bb8'::uuid, 'Réduire uniquement les coûts de recrutement', false, 2),
    ('1e5b689a-58f4-4ad7-84c9-2ed2fdea1bb8'::uuid, 'Remplacer les entretiens individuels', false, 3),
    ('df895675-5e29-4b28-b2c3-e5fd3f4d99dc'::uuid, 'Identifier les forces et les besoins de développement', true, 1),
    ('df895675-5e29-4b28-b2c3-e5fd3f4d99dc'::uuid, 'Supprimer les échanges avec les managers', false, 2),
    ('df895675-5e29-4b28-b2c3-e5fd3f4d99dc'::uuid, 'Évaluer seulement l''ancienneté', false, 3),
    ('e6b2a25f-e427-418a-beef-eef5effd62e2'::uuid, 'Suivre une formation adaptée à ses besoins', true, 1),
    ('e6b2a25f-e427-418a-beef-eef5effd62e2'::uuid, 'Éviter toute nouvelle mission', false, 2),
    ('e6b2a25f-e427-418a-beef-eef5effd62e2'::uuid, 'Réduire le partage de connaissances', false, 3),
    ('5cc4be60-a301-4394-b0f3-80b7f9efa903'::uuid, 'Utiliser des évaluations et des mises en situation', true, 1),
    ('5cc4be60-a301-4394-b0f3-80b7f9efa903'::uuid, 'Se baser uniquement sur le diplôme', false, 2),
    ('5cc4be60-a301-4394-b0f3-80b7f9efa903'::uuid, 'Ne jamais recueillir de retour', false, 3),
    ('017fc5f6-aa50-4d81-a90f-d2a7c3e53916'::uuid, 'Combler les écarts et préparer les évolutions du poste', true, 1),
    ('017fc5f6-aa50-4d81-a90f-d2a7c3e53916'::uuid, 'Remplacer la collaboration entre équipes', false, 2),
    ('017fc5f6-aa50-4d81-a90f-d2a7c3e53916'::uuid, 'Supprimer les objectifs professionnels', false, 3)
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT a.question_id, a.answer, a.est_correcte, a.ordre
FROM answers a
WHERE NOT EXISTS (
  SELECT 1 FROM quiz_answers qa WHERE qa.question_id = a.question_id
);
