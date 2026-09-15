-- Les formations présentielles ne proposent ni parcours e-learning ni quiz en ligne.
DELETE FROM quiz
WHERE formation_id IN (SELECT id FROM formations WHERE modalite = 'presentiel');
