-- Diversifie le quiz "Évaluation des compétences professionnelles".
UPDATE quiz_questions SET type = 'choix_unique'
WHERE id = '1e5b689a-58f4-4ad7-84c9-2ed2fdea1bb8';

UPDATE quiz_questions
SET question = 'Vrai ou faux : identifier les compétences aide à repérer les besoins de développement des collaborateurs.',
    type = 'vrai_faux'
WHERE id = 'df895675-5e29-4b28-b2c3-e5fd3f4d99dc';

UPDATE quiz_questions
SET question = 'Citez l''action la plus adaptée pour développer les compétences d''un collaborateur.',
    type = 'reponse_libre'
WHERE id = 'e6b2a25f-e427-418a-beef-eef5effd62e2';

UPDATE quiz_questions SET type = 'choix_multiple'
WHERE id = '5cc4be60-a301-4394-b0f3-80b7f9efa903';

UPDATE quiz_questions SET type = 'choix_unique'
WHERE id = '017fc5f6-aa50-4d81-a90f-d2a7c3e53916';

DELETE FROM quiz_answers
WHERE question_id IN (
  'df895675-5e29-4b28-b2c3-e5fd3f4d99dc'::uuid,
  'e6b2a25f-e427-418a-beef-eef5effd62e2'::uuid
);

INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre) VALUES
  ('df895675-5e29-4b28-b2c3-e5fd3f4d99dc', 'Vrai', true, 1),
  ('df895675-5e29-4b28-b2c3-e5fd3f4d99dc', 'Faux', false, 2),
  ('e6b2a25f-e427-418a-beef-eef5effd62e2', 'Suivre une formation adaptée à ses besoins', true, 1);
