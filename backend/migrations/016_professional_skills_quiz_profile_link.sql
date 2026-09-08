-- Le quiz « Évaluation des compétences professionnelles » doit alimenter
-- le profil et délivrer une certification lorsqu'il est validé.
INSERT INTO formation_competences (formation_id, competence_id, niveau_vise)
VALUES ('0869f33e-ebc0-4733-8107-113eb37bbfeb', '6c898c0d-0783-4f8b-a5a1-492a9c7bcd58', 2)
ON CONFLICT (formation_id, competence_id) DO UPDATE
SET niveau_vise = EXCLUDED.niveau_vise;
