-- Garantit deux sessions programmées pour chaque formation du catalogue.
-- Les dates sont calculées à partir de la date courante afin de rester cohérentes
-- avec les certificats délivrés après le parcours et le quiz.
WITH sessions_a_completer AS (
  SELECT f.id AS formation_id,
         GREATEST(0, 2 - COUNT(s.id))::integer AS missing
  FROM formations f
  LEFT JOIN training_sessions s ON s.formation_id = f.id
  GROUP BY f.id
), slots AS (
  SELECT formation_id, generate_series(1, missing) AS slot
  FROM sessions_a_completer
  WHERE missing > 0
)
INSERT INTO training_sessions (
  formation_id, date_debut, date_fin, lieu, capacite, statut
)
SELECT
  formation_id,
  (CURRENT_DATE + (21 + ((slot - 1) * 28)) * INTERVAL '1 day')::timestamp,
  (CURRENT_DATE + (21 + ((slot - 1) * 28)) * INTERVAL '1 day' + INTERVAL '1 day')::timestamp,
  NULL,
  NULL,
  'ouverte'
FROM slots;
