-- ============================================================
-- migration_quiz_complete.sql
--
-- Régénère intégralement les questions et réponses des 7 quiz
-- techniques (NestJS, React, Docker, Kubernetes, C#, Spring Boot,
-- C++) avec une structure homogène : 3 QCM + 1 Vrai/Faux +
-- 1 réponse libre par formation (35 questions au total).
--
-- Les UUID des quiz existants (créés dans 008_fix_quiz_uuids.sql)
-- sont conservés. Ce fichier est idempotent : il peut être rejoué
-- sans dupliquer les quiz eux-mêmes (ON CONFLICT DO NOTHING), et
-- repart toujours d'une base propre pour leurs questions/réponses
-- (DELETE avant réinsertion).
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 0. S'assurer que les 7 quiz existent (sans écraser s'ils sont
--    déjà présents — conserve les UUID existants).
-- ------------------------------------------------------------

INSERT INTO quiz (id, formation_id, titre, description, duree, score_requis, statut)
VALUES
  ('4f16f04e-8c92-4225-ab24-c45cbb9ea76f', '11111111-1111-1111-1111-111111111111',
   'Évaluation NestJS', 'Quiz de validation des bases de NestJS.', 15, 70, 'active'),
  ('ce7fd0a5-6b79-41c3-865e-80954949e764', '22222222-2222-2222-2222-222222222222',
   'Évaluation React', 'Quiz de validation des bases de React.', 15, 70, 'active'),
  ('4fb9d597-38d4-4f31-a203-3a010a3ef36a', '33333333-3333-3333-3333-333333333333',
   'Évaluation Docker', 'Quiz de validation des bases de Docker.', 15, 70, 'active'),
  ('337d57dc-e5ee-44fc-bf20-13edb5f4da89', '44444444-4444-4444-4444-444444444444',
   'Évaluation Kubernetes', 'Quiz de validation des bases de Kubernetes.', 15, 70, 'active'),
  ('af410e09-2e08-4dfb-84ac-df1a40e086e2', '55555555-5555-5555-5555-555555555555',
   'Évaluation C#', 'Quiz de validation des bases de C#.', 15, 70, 'active'),
  ('fa31c671-0652-46fd-8cf4-cc5fa13f5ba6', '66666666-6666-6666-6666-666666666666',
   'Évaluation Spring Boot', 'Quiz de validation des bases de Spring Boot.', 15, 70, 'active'),
  ('74bf8864-2c59-4fec-a11b-d6d9773f0e70', '77777777-7777-7777-7777-777777777777',
   'Évaluation C++', 'Quiz de validation des bases avancées de C++.', 15, 70, 'active')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- 1. Nettoyage : suppression des anciennes questions de ces
--    7 quiz. Le ON DELETE CASCADE sur quiz_answers.question_id
--    supprime automatiquement leurs réponses associées.
-- ------------------------------------------------------------

DELETE FROM quiz_questions WHERE quiz_id IN (
  '4f16f04e-8c92-4225-ab24-c45cbb9ea76f',
  'ce7fd0a5-6b79-41c3-865e-80954949e764',
  '4fb9d597-38d4-4f31-a203-3a010a3ef36a',
  '337d57dc-e5ee-44fc-bf20-13edb5f4da89',
  'af410e09-2e08-4dfb-84ac-df1a40e086e2',
  'fa31c671-0652-46fd-8cf4-cc5fa13f5ba6',
  '74bf8864-2c59-4fec-a11b-d6d9773f0e70'
);

-- ============================================================
-- 2. NESTJS — quiz 4f16f04e-8c92-4225-ab24-c45cbb9ea76f
-- ============================================================

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('4f16f04e-8c92-4225-ab24-c45cbb9ea76f', 'Quel décorateur définit un contrôleur dans NestJS ?', 'multiple_choice', 1)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, '@Controller', true, 1 FROM q
UNION ALL SELECT id, '@Injectable', false, 2 FROM q
UNION ALL SELECT id, '@Module', false, 3 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('4f16f04e-8c92-4225-ab24-c45cbb9ea76f', 'Quel module gère l''injection de dépendances dans NestJS ?', 'multiple_choice', 2)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'Le système de providers/DI intégré', true, 1 FROM q
UNION ALL SELECT id, 'Express directement', false, 2 FROM q
UNION ALL SELECT id, 'Aucun, il faut tout instancier manuellement', false, 3 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('4f16f04e-8c92-4225-ab24-c45cbb9ea76f', 'Quel ORM est utilisé dans ce projet avec NestJS ?', 'multiple_choice', 3)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'TypeORM', true, 1 FROM q
UNION ALL SELECT id, 'Mongoose', false, 2 FROM q
UNION ALL SELECT id, 'Sequelize', false, 3 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('4f16f04e-8c92-4225-ab24-c45cbb9ea76f', 'NestJS est construit au-dessus d''Express ou Fastify.', 'vrai_faux', 4)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'Vrai', true, 1 FROM q
UNION ALL SELECT id, 'Faux', false, 2 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('4f16f04e-8c92-4225-ab24-c45cbb9ea76f', 'Quelle commande CLI permet de générer un nouveau module NestJS ?', 'reponse_libre', 5)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'nest generate module', true, 1 FROM q;

-- ============================================================
-- 3. REACT — quiz ce7fd0a5-6b79-41c3-865e-80954949e764
-- ============================================================

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('ce7fd0a5-6b79-41c3-865e-80954949e764', 'Quel hook permet de gérer un état local dans un composant ?', 'multiple_choice', 1)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'useState', true, 1 FROM q
UNION ALL SELECT id, 'useEffect', false, 2 FROM q
UNION ALL SELECT id, 'useContext', false, 3 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('ce7fd0a5-6b79-41c3-865e-80954949e764', 'Quel hook permet d''exécuter du code après le rendu ?', 'multiple_choice', 2)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'useEffect', true, 1 FROM q
UNION ALL SELECT id, 'useState', false, 2 FROM q
UNION ALL SELECT id, 'useMemo', false, 3 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('ce7fd0a5-6b79-41c3-865e-80954949e764', 'Comment appelle-t-on la syntaxe XML utilisée dans React ?', 'multiple_choice', 3)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'JSX', true, 1 FROM q
UNION ALL SELECT id, 'HTML5', false, 2 FROM q
UNION ALL SELECT id, 'Pug', false, 3 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('ce7fd0a5-6b79-41c3-865e-80954949e764', 'Dans React, les props sont modifiables directement par le composant enfant.', 'vrai_faux', 4)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'Vrai', false, 1 FROM q
UNION ALL SELECT id, 'Faux', true, 2 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('ce7fd0a5-6b79-41c3-865e-80954949e764', 'Quelle fonction permet de mémoriser une valeur calculée entre les rendus ?', 'reponse_libre', 5)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'useMemo', true, 1 FROM q;

-- ============================================================
-- 4. DOCKER — quiz 4fb9d597-38d4-4f31-a203-3a010a3ef36a
-- ============================================================

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('4fb9d597-38d4-4f31-a203-3a010a3ef36a', 'Quel fichier décrit l''image d''un conteneur Docker ?', 'multiple_choice', 1)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'Dockerfile', true, 1 FROM q
UNION ALL SELECT id, 'docker-compose.yml', false, 2 FROM q
UNION ALL SELECT id, 'image.json', false, 3 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('4fb9d597-38d4-4f31-a203-3a010a3ef36a', 'Quelle commande démarre les services définis dans un docker-compose.yml ?', 'multiple_choice', 2)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'docker compose up', true, 1 FROM q
UNION ALL SELECT id, 'docker build', false, 2 FROM q
UNION ALL SELECT id, 'docker run', false, 3 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('4fb9d597-38d4-4f31-a203-3a010a3ef36a', 'Quel terme désigne une instance en cours d''exécution d''une image ?', 'multiple_choice', 3)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'Un conteneur', true, 1 FROM q
UNION ALL SELECT id, 'Un registre', false, 2 FROM q
UNION ALL SELECT id, 'Un volume', false, 3 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('4fb9d597-38d4-4f31-a203-3a010a3ef36a', 'Une image Docker peut être partagée via un registre comme Docker Hub.', 'vrai_faux', 4)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'Vrai', true, 1 FROM q
UNION ALL SELECT id, 'Faux', false, 2 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('4fb9d597-38d4-4f31-a203-3a010a3ef36a', 'Quelle commande liste les conteneurs en cours d''exécution ?', 'reponse_libre', 5)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'docker ps', true, 1 FROM q;

-- ============================================================
-- 5. KUBERNETES — quiz 337d57dc-e5ee-44fc-bf20-13edb5f4da89
-- ============================================================

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('337d57dc-e5ee-44fc-bf20-13edb5f4da89', 'Quelle est la plus petite unité déployable dans Kubernetes ?', 'multiple_choice', 1)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'Le Pod', true, 1 FROM q
UNION ALL SELECT id, 'Le Node', false, 2 FROM q
UNION ALL SELECT id, 'Le Cluster', false, 3 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('337d57dc-e5ee-44fc-bf20-13edb5f4da89', 'Quel objet Kubernetes gère la mise à l''échelle et la résilience de pods ?', 'multiple_choice', 2)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'Le Deployment', true, 1 FROM q
UNION ALL SELECT id, 'Le ConfigMap', false, 2 FROM q
UNION ALL SELECT id, 'Le Namespace', false, 3 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('337d57dc-e5ee-44fc-bf20-13edb5f4da89', 'Quel composant expose un ensemble de pods comme un service réseau ?', 'multiple_choice', 3)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'Le Service', true, 1 FROM q
UNION ALL SELECT id, 'Le Secret', false, 2 FROM q
UNION ALL SELECT id, 'L''Ingress uniquement', false, 3 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('337d57dc-e5ee-44fc-bf20-13edb5f4da89', 'Un Pod Kubernetes ne peut contenir qu''un seul conteneur.', 'vrai_faux', 4)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'Vrai', false, 1 FROM q
UNION ALL SELECT id, 'Faux', true, 2 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('337d57dc-e5ee-44fc-bf20-13edb5f4da89', 'Quelle commande kubectl permet de lister les pods en cours d''exécution ?', 'reponse_libre', 5)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'kubectl get pods', true, 1 FROM q;

-- ============================================================
-- 6. C# — quiz af410e09-2e08-4dfb-84ac-df1a40e086e2
-- ============================================================

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('af410e09-2e08-4dfb-84ac-df1a40e086e2', 'Quelle entreprise a développé le langage C# ?', 'multiple_choice', 1)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'Microsoft', true, 1 FROM q
UNION ALL SELECT id, 'Oracle', false, 2 FROM q
UNION ALL SELECT id, 'Google', false, 3 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('af410e09-2e08-4dfb-84ac-df1a40e086e2', 'Quel framework est couramment utilisé pour créer des API web en C# ?', 'multiple_choice', 2)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'ASP.NET Core', true, 1 FROM q
UNION ALL SELECT id, 'Django', false, 2 FROM q
UNION ALL SELECT id, 'Laravel', false, 3 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('af410e09-2e08-4dfb-84ac-df1a40e086e2', 'C# est un langage à typage...', 'multiple_choice', 3)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'Statique', true, 1 FROM q
UNION ALL SELECT id, 'Dynamique', false, 2 FROM q
UNION ALL SELECT id, 'Non typé', false, 3 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('af410e09-2e08-4dfb-84ac-df1a40e086e2', 'C# s''exécute directement sur le runtime .NET (CLR).', 'vrai_faux', 4)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'Vrai', true, 1 FROM q
UNION ALL SELECT id, 'Faux', false, 2 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('af410e09-2e08-4dfb-84ac-df1a40e086e2', 'Quel mot-clé permet de déclarer une classe qui ne peut pas être héritée en C# ?', 'reponse_libre', 5)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'sealed', true, 1 FROM q;

-- ============================================================
-- 7. SPRING BOOT — quiz fa31c671-0652-46fd-8cf4-cc5fa13f5ba6
-- ============================================================

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('fa31c671-0652-46fd-8cf4-cc5fa13f5ba6', 'Quelle annotation marque la classe principale d''une application Spring Boot ?', 'multiple_choice', 1)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, '@SpringBootApplication', true, 1 FROM q
UNION ALL SELECT id, '@Component', false, 2 FROM q
UNION ALL SELECT id, '@Service', false, 3 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('fa31c671-0652-46fd-8cf4-cc5fa13f5ba6', 'Quel outil de build est couramment utilisé avec Spring Boot ?', 'multiple_choice', 2)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'Maven ou Gradle', true, 1 FROM q
UNION ALL SELECT id, 'npm', false, 2 FROM q
UNION ALL SELECT id, 'pip', false, 3 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('fa31c671-0652-46fd-8cf4-cc5fa13f5ba6', 'Quelle annotation expose une méthode comme endpoint REST ?', 'multiple_choice', 3)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, '@RestController', true, 1 FROM q
UNION ALL SELECT id, '@Entity', false, 2 FROM q
UNION ALL SELECT id, '@Repository', false, 3 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('fa31c671-0652-46fd-8cf4-cc5fa13f5ba6', 'Spring Boot nécessite obligatoirement un serveur d''application externe installé séparément.', 'vrai_faux', 4)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'Vrai', false, 1 FROM q
UNION ALL SELECT id, 'Faux', true, 2 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('fa31c671-0652-46fd-8cf4-cc5fa13f5ba6', 'Quel fichier de configuration principal utilise Spring Boot par défaut (hors YAML) ?', 'reponse_libre', 5)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'application.properties', true, 1 FROM q;

-- ============================================================
-- 8. C++ — quiz 74bf8864-2c59-4fec-a11b-d6d9773f0e70
-- ============================================================

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('74bf8864-2c59-4fec-a11b-d6d9773f0e70', 'Quel mécanisme C++ permet de libérer automatiquement la mémoire allouée ?', 'multiple_choice', 1)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'Les smart pointers (RAII)', true, 1 FROM q
UNION ALL SELECT id, 'Le garbage collector', false, 2 FROM q
UNION ALL SELECT id, 'Rien, il n''y a pas de gestion automatique', false, 3 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('74bf8864-2c59-4fec-a11b-d6d9773f0e70', 'Quel mot-clé permet de définir une méthode redéfinissable dans une sous-classe ?', 'multiple_choice', 2)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'virtual', true, 1 FROM q
UNION ALL SELECT id, 'static', false, 2 FROM q
UNION ALL SELECT id, 'const', false, 3 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('74bf8864-2c59-4fec-a11b-d6d9773f0e70', 'Quel opérateur permet d''allouer dynamiquement de la mémoire en C++ ?', 'multiple_choice', 3)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'new', true, 1 FROM q
UNION ALL SELECT id, 'malloc', false, 2 FROM q
UNION ALL SELECT id, 'alloc', false, 3 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('74bf8864-2c59-4fec-a11b-d6d9773f0e70', 'En C++, un destructeur peut être déclaré virtuel.', 'vrai_faux', 4)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'Vrai', true, 1 FROM q
UNION ALL SELECT id, 'Faux', false, 2 FROM q;

WITH q AS (
  INSERT INTO quiz_questions (quiz_id, question, type, ordre)
  VALUES ('74bf8864-2c59-4fec-a11b-d6d9773f0e70', 'Quel mot-clé empêche la modification d''une variable après son initialisation en C++ ?', 'reponse_libre', 5)
  RETURNING id
)
INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre)
SELECT id, 'const', true, 1 FROM q;

COMMIT;

-- ============================================================
-- 9. VÉRIFICATIONS
-- ============================================================

-- 9.1 — Nombre de quiz concernés (attendu : 7)
SELECT COUNT(*) AS nb_quiz
FROM quiz
WHERE id IN (
  '4f16f04e-8c92-4225-ab24-c45cbb9ea76f',
  'ce7fd0a5-6b79-41c3-865e-80954949e764',
  '4fb9d597-38d4-4f31-a203-3a010a3ef36a',
  '337d57dc-e5ee-44fc-bf20-13edb5f4da89',
  'af410e09-2e08-4dfb-84ac-df1a40e086e2',
  'fa31c671-0652-46fd-8cf4-cc5fa13f5ba6',
  '74bf8864-2c59-4fec-a11b-d6d9773f0e70'
);

-- 9.2 — Nombre total de questions (attendu : 35)
SELECT COUNT(*) AS nb_questions
FROM quiz_questions
WHERE quiz_id IN (
  '4f16f04e-8c92-4225-ab24-c45cbb9ea76f',
  'ce7fd0a5-6b79-41c3-865e-80954949e764',
  '4fb9d597-38d4-4f31-a203-3a010a3ef36a',
  '337d57dc-e5ee-44fc-bf20-13edb5f4da89',
  'af410e09-2e08-4dfb-84ac-df1a40e086e2',
  'fa31c671-0652-46fd-8cf4-cc5fa13f5ba6',
  '74bf8864-2c59-4fec-a11b-d6d9773f0e70'
);

-- 9.3 — Répartition par type (attendu : 21 QCM, 7 vrai_faux, 7 reponse_libre)
SELECT type, COUNT(*) AS nb
FROM quiz_questions
WHERE quiz_id IN (
  '4f16f04e-8c92-4225-ab24-c45cbb9ea76f',
  'ce7fd0a5-6b79-41c3-865e-80954949e764',
  '4fb9d597-38d4-4f31-a203-3a010a3ef36a',
  '337d57dc-e5ee-44fc-bf20-13edb5f4da89',
  'af410e09-2e08-4dfb-84ac-df1a40e086e2',
  'fa31c671-0652-46fd-8cf4-cc5fa13f5ba6',
  '74bf8864-2c59-4fec-a11b-d6d9773f0e70'
)
GROUP BY type
ORDER BY type;

-- 9.4 — Nombre de réponses par question (QCM=3, vrai_faux=2, reponse_libre=1)
SELECT
  f.titre AS formation,
  qz.titre AS quiz,
  qq.ordre,
  qq.type,
  qq.question,
  COUNT(qa.id) AS nb_reponses
FROM quiz_questions qq
JOIN quiz qz ON qz.id = qq.quiz_id
JOIN formations f ON f.id = qz.formation_id
LEFT JOIN quiz_answers qa ON qa.question_id = qq.id
WHERE qq.quiz_id IN (
  '4f16f04e-8c92-4225-ab24-c45cbb9ea76f',
  'ce7fd0a5-6b79-41c3-865e-80954949e764',
  '4fb9d597-38d4-4f31-a203-3a010a3ef36a',
  '337d57dc-e5ee-44fc-bf20-13edb5f4da89',
  'af410e09-2e08-4dfb-84ac-df1a40e086e2',
  'fa31c671-0652-46fd-8cf4-cc5fa13f5ba6',
  '74bf8864-2c59-4fec-a11b-d6d9773f0e70'
)
GROUP BY f.titre, qz.titre, qq.ordre, qq.type, qq.question
ORDER BY f.titre, qq.ordre;

-- 9.5 — Bonnes réponses par question
SELECT
  qz.titre AS quiz,
  qq.ordre,
  qq.question,
  qa.answer AS bonne_reponse
FROM quiz_questions qq
JOIN quiz qz ON qz.id = qq.quiz_id
JOIN quiz_answers qa ON qa.question_id = qq.id
WHERE qa.est_correcte = true
  AND qq.quiz_id IN (
    '4f16f04e-8c92-4225-ab24-c45cbb9ea76f',
    'ce7fd0a5-6b79-41c3-865e-80954949e764',
    '4fb9d597-38d4-4f31-a203-3a010a3ef36a',
    '337d57dc-e5ee-44fc-bf20-13edb5f4da89',
    'af410e09-2e08-4dfb-84ac-df1a40e086e2',
    'fa31c671-0652-46fd-8cf4-cc5fa13f5ba6',
    '74bf8864-2c59-4fec-a11b-d6d9773f0e70'
  )
ORDER BY qz.titre, qq.ordre;

-- 9.6 — Récapitulatif final : nombre de questions par formation et par type
SELECT
  f.titre AS formation,
  COUNT(*) FILTER (WHERE qq.type = 'multiple_choice') AS qcm,
  COUNT(*) FILTER (WHERE qq.type = 'vrai_faux') AS vrai_faux,
  COUNT(*) FILTER (WHERE qq.type = 'reponse_libre') AS reponse_libre,
  COUNT(*) AS total
FROM quiz_questions qq
JOIN quiz qz ON qz.id = qq.quiz_id
JOIN formations f ON f.id = qz.formation_id
WHERE qq.quiz_id IN (
  '4f16f04e-8c92-4225-ab24-c45cbb9ea76f',
  'ce7fd0a5-6b79-41c3-865e-80954949e764',
  '4fb9d597-38d4-4f31-a203-3a010a3ef36a',
  '337d57dc-e5ee-44fc-bf20-13edb5f4da89',
  'af410e09-2e08-4dfb-84ac-df1a40e086e2',
  'fa31c671-0652-46fd-8cf4-cc5fa13f5ba6',
  '74bf8864-2c59-4fec-a11b-d6d9773f0e70'
)
GROUP BY f.titre
ORDER BY f.titre;

-- 9.7 — Total général (doit donner qcm=21, vrai_faux=7, reponse_libre=7, total=35)
SELECT
  COUNT(*) FILTER (WHERE qq.type = 'multiple_choice') AS total_qcm,
  COUNT(*) FILTER (WHERE qq.type = 'vrai_faux') AS total_vrai_faux,
  COUNT(*) FILTER (WHERE qq.type = 'reponse_libre') AS total_reponse_libre,
  COUNT(*) AS total_questions
FROM quiz_questions qq
WHERE qq.quiz_id IN (
  '4f16f04e-8c92-4225-ab24-c45cbb9ea76f',
  'ce7fd0a5-6b79-41c3-865e-80954949e764',
  '4fb9d597-38d4-4f31-a203-3a010a3ef36a',
  '337d57dc-e5ee-44fc-bf20-13edb5f4da89',
  'af410e09-2e08-4dfb-84ac-df1a40e086e2',
  'fa31c671-0652-46fd-8cf4-cc5fa13f5ba6',
  '74bf8864-2c59-4fec-a11b-d6d9773f0e70'
);
