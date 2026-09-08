-- Répartition des sessions du catalogue :
-- 1111/2222 : deux sessions ; 3333/4444/5555 : une session ;
-- 6666/7777 : aucune session programmée.
-- La migration est relançable sans créer de doublons.

WITH desired(formation_id, session_count) AS (
  VALUES
    ('11111111-1111-1111-1111-111111111111'::uuid, 2),
    ('22222222-2222-2222-2222-222222222222'::uuid, 2),
    ('33333333-3333-3333-3333-333333333333'::uuid, 1),
    ('44444444-4444-4444-4444-444444444444'::uuid, 1),
    ('55555555-5555-5555-5555-555555555555'::uuid, 1),
    ('66666666-6666-6666-6666-666666666666'::uuid, 0),
    ('77777777-7777-7777-7777-777777777777'::uuid, 0)
), missing AS (
  SELECT d.formation_id, d.session_count - COUNT(s.id)::integer AS amount
  FROM desired d
  LEFT JOIN training_sessions s ON s.formation_id = d.formation_id
  GROUP BY d.formation_id, d.session_count
), slots AS (
  SELECT formation_id, generate_series(1, amount) AS slot
  FROM missing
  WHERE amount > 0
)
INSERT INTO training_sessions (formation_id, date_debut, date_fin, lieu, capacite, statut)
SELECT formation_id,
       (CURRENT_DATE + (21 + ((slot - 1) * 28)) * INTERVAL '1 day')::timestamp,
       (CURRENT_DATE + (21 + ((slot - 1) * 28)) * INTERVAL '1 day' + INTERVAL '1 day')::timestamp,
       NULL, NULL, 'ouverte'
FROM slots;

WITH desired(formation_id, session_count) AS (
  VALUES
    ('11111111-1111-1111-1111-111111111111'::uuid, 2),
    ('22222222-2222-2222-2222-222222222222'::uuid, 2),
    ('33333333-3333-3333-3333-333333333333'::uuid, 1),
    ('44444444-4444-4444-4444-444444444444'::uuid, 1),
    ('55555555-5555-5555-5555-555555555555'::uuid, 1),
    ('66666666-6666-6666-6666-666666666666'::uuid, 0),
    ('77777777-7777-7777-7777-777777777777'::uuid, 0)
), ranked AS (
  SELECT s.id, d.session_count,
         ROW_NUMBER() OVER (PARTITION BY s.formation_id ORDER BY s.date_debut, s.id) AS position
  FROM training_sessions s
  JOIN desired d ON d.formation_id = s.formation_id
)
DELETE FROM training_sessions s
USING ranked r
WHERE s.id = r.id AND r.position > r.session_count
  AND NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.training_session_id = s.id);
