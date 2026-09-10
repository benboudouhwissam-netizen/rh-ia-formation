-- Un seul certificat par employé, compétence et intitulé de certification.
-- La déduplication conserve le certificat le plus ancien et ses liens.
WITH ranked AS (
  SELECT id,
         FIRST_VALUE(id) OVER (
           PARTITION BY utilisateur_id, nom_certification
           ORDER BY date_obtention, id
         ) AS keep_id,
         ROW_NUMBER() OVER (
           PARTITION BY utilisateur_id, nom_certification
           ORDER BY date_obtention, id
         ) AS row_number
  FROM certifications
), duplicate_links AS (
  SELECT duplicate.id AS duplicate_id, duplicate.keep_id, links.formation_id
  FROM ranked duplicate
  JOIN link_certifications_formations links
    ON links.certification_id = duplicate.id
  WHERE duplicate.row_number > 1
    AND NOT EXISTS (
      SELECT 1
      FROM link_certifications_formations existing
      WHERE existing.certification_id = duplicate.keep_id
        AND existing.formation_id = links.formation_id
    )
)
INSERT INTO link_certifications_formations (certification_id, formation_id)
SELECT keep_id, formation_id FROM duplicate_links;

WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY utilisateur_id, nom_certification
           ORDER BY date_obtention, id
         ) AS row_number
  FROM certifications
)
DELETE FROM link_certifications_formations links
USING ranked duplicate
WHERE links.certification_id = duplicate.id
  AND duplicate.row_number > 1;

WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY utilisateur_id, nom_certification
           ORDER BY date_obtention, id
         ) AS row_number
  FROM certifications
)
DELETE FROM certifications certificates
USING ranked duplicate
WHERE certificates.id = duplicate.id
  AND duplicate.row_number > 1;

CREATE UNIQUE INDEX IF NOT EXISTS uq_certifications_employee_name
  ON certifications (utilisateur_id, nom_certification);
