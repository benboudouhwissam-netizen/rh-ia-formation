-- Rattrapage des salariés ayant validé ce quiz avant l'ajout du lien
-- formation-compétence. Ils reçoivent la compétence Python niveau 2 et le
-- certificat sans avoir à repasser l'évaluation.
WITH successful_users AS (
  SELECT DISTINCT qr.utilisateur_id
  FROM quiz_results qr
  WHERE qr.quiz_id = 'a20281ee-d606-4cdc-8cdf-7c4b5fdbbf12'
    AND qr.reussi = true
)
INSERT INTO employee_competences (utilisateur_id, competence_id, niveau, source, date_evaluation)
SELECT utilisateur_id, '6c898c0d-0783-4f8b-a5a1-492a9c7bcd58', 2, 'quiz', now()
FROM successful_users
ON CONFLICT (utilisateur_id, competence_id) DO UPDATE
SET niveau = GREATEST(employee_competences.niveau, EXCLUDED.niveau),
    source = CASE WHEN employee_competences.niveau < EXCLUDED.niveau THEN 'quiz' ELSE employee_competences.source END,
    date_evaluation = CASE WHEN employee_competences.niveau < EXCLUDED.niveau THEN EXCLUDED.date_evaluation ELSE employee_competences.date_evaluation END;

WITH successful_users AS (
  SELECT DISTINCT qr.utilisateur_id
  FROM quiz_results qr
  WHERE qr.quiz_id = 'a20281ee-d606-4cdc-8cdf-7c4b5fdbbf12'
    AND qr.reussi = true
)
INSERT INTO certifications (utilisateur_id, competence_id, nom_certification, organisme, date_obtention)
SELECT utilisateur_id,
       '6c898c0d-0783-4f8b-a5a1-492a9c7bcd58',
       'Validation — Évaluation des compétences professionnelles',
       'RH Manager',
       CURRENT_DATE
FROM successful_users
WHERE NOT EXISTS (
  SELECT 1
  FROM certifications existing
  WHERE existing.utilisateur_id = successful_users.utilisateur_id
    AND existing.competence_id = '6c898c0d-0783-4f8b-a5a1-492a9c7bcd58'
    AND existing.nom_certification = 'Validation — Évaluation des compétences professionnelles'
);
