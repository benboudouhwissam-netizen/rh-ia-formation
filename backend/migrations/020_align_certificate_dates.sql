-- Les données de démonstration contenaient des certificats datés avant
-- la session suivie. On les aligne après les deux sessions programmées
-- créées par la migration 019.
UPDATE certifications
SET date_obtention = CURRENT_DATE + 22
WHERE date_obtention < CURRENT_DATE + 22;
