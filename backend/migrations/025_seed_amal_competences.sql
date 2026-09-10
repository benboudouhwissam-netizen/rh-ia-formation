-- Profil de démonstration Amal El Fassi : compétences cohérentes avec
-- le poste « Ingénieur logiciel senior » afin d'éviter une ligne vide.
WITH amal AS (
  SELECT MIN(id::text)::uuid AS id
  FROM employee_accounts
  WHERE nom_complet ILIKE 'Amal El Fassi'
), skills(nom, niveau) AS (
  VALUES ('Python', 2), ('NestJS', 2), ('Docker', 3)
)
INSERT INTO employee_competences (utilisateur_id, competence_id, niveau, source, date_evaluation)
SELECT amal.id, c.id, skills.niveau, 'manager', NOW()
FROM amal
JOIN skills ON TRUE
JOIN competences c ON c.nom = skills.nom
WHERE amal.id IS NOT NULL
ON CONFLICT (utilisateur_id, competence_id)
DO UPDATE SET niveau = EXCLUDED.niveau,
              source = EXCLUDED.source,
              date_evaluation = EXCLUDED.date_evaluation;
