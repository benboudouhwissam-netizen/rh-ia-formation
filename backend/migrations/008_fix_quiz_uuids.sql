-- ============================================================
-- Correction : remplace les quiz/questions/réponses de la
-- migration 007 (IDs non conformes UUID v4) par des versions
-- avec de vrais UUID v4 générés aléatoirement.
-- ============================================================

-- Suppression des anciens quiz "techniques" (007) — le ON DELETE CASCADE
-- sur quiz_questions et quiz_answers supprime automatiquement leurs
-- questions et réponses associées.
DELETE FROM quiz WHERE id IN (
  'a1111111-0000-0000-0000-000000000001',
  'a2222222-0000-0000-0000-000000000001',
  'a3333333-0000-0000-0000-000000000001',
  'a4444444-0000-0000-0000-000000000001',
  'a5555555-0000-0000-0000-000000000001',
  'a6666666-0000-0000-0000-000000000001',
  'a7777777-0000-0000-0000-000000000001'
);

-- ------------------------------------------------------------
-- Quiz : Développement backend avec NestJS
-- ------------------------------------------------------------
INSERT INTO quiz (id, formation_id, titre, description, duree, score_requis, statut)
VALUES ('4f16f04e-8c92-4225-ab24-c45cbb9ea76f', '11111111-1111-1111-1111-111111111111',
  'Évaluation NestJS', 'Quiz de validation des bases de NestJS.', 15, 70, 'active');

INSERT INTO quiz_questions (id, quiz_id, question, type, ordre) VALUES
('3037b764-013d-46fc-8c22-11e66df7e43c', '4f16f04e-8c92-4225-ab24-c45cbb9ea76f', 'Quel décorateur définit un contrôleur dans NestJS ?', 'multiple_choice', 1),
('61c15ea0-9f99-4fd9-ada7-878387944576', '4f16f04e-8c92-4225-ab24-c45cbb9ea76f', 'Quel module gère l''injection de dépendances dans NestJS ?', 'multiple_choice', 2),
('454b1305-60c4-463b-8f80-9cb71cb57a1a', '4f16f04e-8c92-4225-ab24-c45cbb9ea76f', 'Quel ORM est utilisé dans ce projet avec NestJS ?', 'multiple_choice', 3);

INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre) VALUES
('3037b764-013d-46fc-8c22-11e66df7e43c', '@Controller', true, 1),
('3037b764-013d-46fc-8c22-11e66df7e43c', '@Injectable', false, 2),
('3037b764-013d-46fc-8c22-11e66df7e43c', '@Module', false, 3),
('61c15ea0-9f99-4fd9-ada7-878387944576', 'Le système de providers/DI intégré', true, 1),
('61c15ea0-9f99-4fd9-ada7-878387944576', 'Express directement', false, 2),
('61c15ea0-9f99-4fd9-ada7-878387944576', 'Aucun, il faut tout instancier manuellement', false, 3),
('454b1305-60c4-463b-8f80-9cb71cb57a1a', 'TypeORM', true, 1),
('454b1305-60c4-463b-8f80-9cb71cb57a1a', 'Mongoose', false, 2),
('454b1305-60c4-463b-8f80-9cb71cb57a1a', 'Sequelize', false, 3);

-- ------------------------------------------------------------
-- Quiz : Interfaces modernes avec React
-- ------------------------------------------------------------
INSERT INTO quiz (id, formation_id, titre, description, duree, score_requis, statut)
VALUES ('ce7fd0a5-6b79-41c3-865e-80954949e764', '22222222-2222-2222-2222-222222222222',
  'Évaluation React', 'Quiz de validation des bases de React.', 15, 70, 'active');

INSERT INTO quiz_questions (id, quiz_id, question, type, ordre) VALUES
('1dfbdab9-50bc-4604-8ca9-19e52eafcc9b', 'ce7fd0a5-6b79-41c3-865e-80954949e764', 'Quel hook permet de gérer un état local dans un composant ?', 'multiple_choice', 1),
('3b3b06b7-d502-4c61-937c-2cffa1d041ca', 'ce7fd0a5-6b79-41c3-865e-80954949e764', 'Quel hook permet d''exécuter du code après le rendu ?', 'multiple_choice', 2),
('fba09645-067c-47e1-8ad1-17a8a29fcdf3', 'ce7fd0a5-6b79-41c3-865e-80954949e764', 'Comment appelle-t-on la syntaxe XML utilisée dans React ?', 'multiple_choice', 3);

INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre) VALUES
('1dfbdab9-50bc-4604-8ca9-19e52eafcc9b', 'useState', true, 1),
('1dfbdab9-50bc-4604-8ca9-19e52eafcc9b', 'useEffect', false, 2),
('1dfbdab9-50bc-4604-8ca9-19e52eafcc9b', 'useContext', false, 3),
('3b3b06b7-d502-4c61-937c-2cffa1d041ca', 'useEffect', true, 1),
('3b3b06b7-d502-4c61-937c-2cffa1d041ca', 'useState', false, 2),
('3b3b06b7-d502-4c61-937c-2cffa1d041ca', 'useMemo', false, 3),
('fba09645-067c-47e1-8ad1-17a8a29fcdf3', 'JSX', true, 1),
('fba09645-067c-47e1-8ad1-17a8a29fcdf3', 'HTML5', false, 2),
('fba09645-067c-47e1-8ad1-17a8a29fcdf3', 'Pug', false, 3);

-- ------------------------------------------------------------
-- Quiz : Conteneurisation avec Docker
-- ------------------------------------------------------------
INSERT INTO quiz (id, formation_id, titre, description, duree, score_requis, statut)
VALUES ('4fb9d597-38d4-4f31-a203-3a010a3ef36a', '33333333-3333-3333-3333-333333333333',
  'Évaluation Docker', 'Quiz de validation des bases de Docker.', 15, 70, 'active');

INSERT INTO quiz_questions (id, quiz_id, question, type, ordre) VALUES
('02cef3cf-ce46-4b3f-b907-89bffe898206', '4fb9d597-38d4-4f31-a203-3a010a3ef36a', 'Quel fichier décrit l''image d''un conteneur Docker ?', 'multiple_choice', 1),
('113b4e2d-40cb-40df-a0c7-6f555ef3a0df', '4fb9d597-38d4-4f31-a203-3a010a3ef36a', 'Quelle commande démarre les services définis dans un docker-compose.yml ?', 'multiple_choice', 2),
('1593d597-9494-43ff-b62d-f560ef58dbfe', '4fb9d597-38d4-4f31-a203-3a010a3ef36a', 'Quel terme désigne une instance en cours d''exécution d''une image ?', 'multiple_choice', 3);

INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre) VALUES
('02cef3cf-ce46-4b3f-b907-89bffe898206', 'Dockerfile', true, 1),
('02cef3cf-ce46-4b3f-b907-89bffe898206', 'docker-compose.yml', false, 2),
('02cef3cf-ce46-4b3f-b907-89bffe898206', 'image.json', false, 3),
('113b4e2d-40cb-40df-a0c7-6f555ef3a0df', 'docker compose up', true, 1),
('113b4e2d-40cb-40df-a0c7-6f555ef3a0df', 'docker build', false, 2),
('113b4e2d-40cb-40df-a0c7-6f555ef3a0df', 'docker run', false, 3),
('1593d597-9494-43ff-b62d-f560ef58dbfe', 'Un conteneur', true, 1),
('1593d597-9494-43ff-b62d-f560ef58dbfe', 'Un registre', false, 2),
('1593d597-9494-43ff-b62d-f560ef58dbfe', 'Un volume', false, 3);

-- ------------------------------------------------------------
-- Quiz : Orchestration avec Kubernetes
-- ------------------------------------------------------------
INSERT INTO quiz (id, formation_id, titre, description, duree, score_requis, statut)
VALUES ('337d57dc-e5ee-44fc-bf20-13edb5f4da89', '44444444-4444-4444-4444-444444444444',
  'Évaluation Kubernetes', 'Quiz de validation des bases de Kubernetes.', 15, 70, 'active');

INSERT INTO quiz_questions (id, quiz_id, question, type, ordre) VALUES
('3441e298-fe6a-4fcc-9ff2-4d444a882296', '337d57dc-e5ee-44fc-bf20-13edb5f4da89', 'Quelle est la plus petite unité déployable dans Kubernetes ?', 'multiple_choice', 1),
('85149d1f-513e-4187-8ece-ae53de152288', '337d57dc-e5ee-44fc-bf20-13edb5f4da89', 'Quel objet Kubernetes gère la mise à l''échelle et la résilience de pods ?', 'multiple_choice', 2),
('a223a67e-abf1-4e86-860d-de3b840fd822', '337d57dc-e5ee-44fc-bf20-13edb5f4da89', 'Quel composant expose un ensemble de pods comme un service réseau ?', 'multiple_choice', 3);

INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre) VALUES
('3441e298-fe6a-4fcc-9ff2-4d444a882296', 'Le Pod', true, 1),
('3441e298-fe6a-4fcc-9ff2-4d444a882296', 'Le Node', false, 2),
('3441e298-fe6a-4fcc-9ff2-4d444a882296', 'Le Cluster', false, 3),
('85149d1f-513e-4187-8ece-ae53de152288', 'Le Deployment', true, 1),
('85149d1f-513e-4187-8ece-ae53de152288', 'Le ConfigMap', false, 2),
('85149d1f-513e-4187-8ece-ae53de152288', 'Le Namespace', false, 3),
('a223a67e-abf1-4e86-860d-de3b840fd822', 'Le Service', true, 1),
('a223a67e-abf1-4e86-860d-de3b840fd822', 'Le Secret', false, 2),
('a223a67e-abf1-4e86-860d-de3b840fd822', 'L''Ingress uniquement', false, 3);

-- ------------------------------------------------------------
-- Quiz : Applications backend avec C#
-- ------------------------------------------------------------
INSERT INTO quiz (id, formation_id, titre, description, duree, score_requis, statut)
VALUES ('af410e09-2e08-4dfb-84ac-df1a40e086e2', '55555555-5555-5555-5555-555555555555',
  'Évaluation C#', 'Quiz de validation des bases de C#.', 15, 70, 'active');

INSERT INTO quiz_questions (id, quiz_id, question, type, ordre) VALUES
('774dd2b5-06d2-4ab8-81c2-d0c5378d1b2b', 'af410e09-2e08-4dfb-84ac-df1a40e086e2', 'Quelle entreprise a développé le langage C# ?', 'multiple_choice', 1),
('42c3c2f2-26ed-434e-8412-d51bced2434b', 'af410e09-2e08-4dfb-84ac-df1a40e086e2', 'Quel framework est couramment utilisé pour créer des API web en C# ?', 'multiple_choice', 2),
('382373d0-db48-48bc-9d1b-40602061d77d', 'af410e09-2e08-4dfb-84ac-df1a40e086e2', 'C# est un langage à typage...', 'multiple_choice', 3);

INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre) VALUES
('774dd2b5-06d2-4ab8-81c2-d0c5378d1b2b', 'Microsoft', true, 1),
('774dd2b5-06d2-4ab8-81c2-d0c5378d1b2b', 'Oracle', false, 2),
('774dd2b5-06d2-4ab8-81c2-d0c5378d1b2b', 'Google', false, 3),
('42c3c2f2-26ed-434e-8412-d51bced2434b', 'ASP.NET Core', true, 1),
('42c3c2f2-26ed-434e-8412-d51bced2434b', 'Django', false, 2),
('42c3c2f2-26ed-434e-8412-d51bced2434b', 'Laravel', false, 3),
('382373d0-db48-48bc-9d1b-40602061d77d', 'Statique', true, 1),
('382373d0-db48-48bc-9d1b-40602061d77d', 'Dynamique', false, 2),
('382373d0-db48-48bc-9d1b-40602061d77d', 'Non typé', false, 3);

-- ------------------------------------------------------------
-- Quiz : Microservices avec Spring Boot
-- ------------------------------------------------------------
INSERT INTO quiz (id, formation_id, titre, description, duree, score_requis, statut)
VALUES ('fa31c671-0652-46fd-8cf4-cc5fa13f5ba6', '66666666-6666-6666-6666-666666666666',
  'Évaluation Spring Boot', 'Quiz de validation des bases de Spring Boot.', 15, 70, 'active');

INSERT INTO quiz_questions (id, quiz_id, question, type, ordre) VALUES
('436d10ed-7049-47a5-8655-70dcf7c8f784', 'fa31c671-0652-46fd-8cf4-cc5fa13f5ba6', 'Quelle annotation marque la classe principale d''une application Spring Boot ?', 'multiple_choice', 1),
('439f0ceb-6d00-4522-9338-7eea8450d7e6', 'fa31c671-0652-46fd-8cf4-cc5fa13f5ba6', 'Quel outil de build est couramment utilisé avec Spring Boot ?', 'multiple_choice', 2),
('99d8fdb1-741f-4ccf-b0a2-6bcc16fc7f9d', 'fa31c671-0652-46fd-8cf4-cc5fa13f5ba6', 'Quelle annotation expose une méthode comme endpoint REST ?', 'multiple_choice', 3);

INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre) VALUES
('436d10ed-7049-47a5-8655-70dcf7c8f784', '@SpringBootApplication', true, 1),
('436d10ed-7049-47a5-8655-70dcf7c8f784', '@Component', false, 2),
('436d10ed-7049-47a5-8655-70dcf7c8f784', '@Service', false, 3),
('439f0ceb-6d00-4522-9338-7eea8450d7e6', 'Maven ou Gradle', true, 1),
('439f0ceb-6d00-4522-9338-7eea8450d7e6', 'npm', false, 2),
('439f0ceb-6d00-4522-9338-7eea8450d7e6', 'pip', false, 3),
('99d8fdb1-741f-4ccf-b0a2-6bcc16fc7f9d', '@RestController', true, 1),
('99d8fdb1-741f-4ccf-b0a2-6bcc16fc7f9d', '@Entity', false, 2),
('99d8fdb1-741f-4ccf-b0a2-6bcc16fc7f9d', '@Repository', false, 3);

-- ------------------------------------------------------------
-- Quiz : Programmation avancée en C++
-- ------------------------------------------------------------
INSERT INTO quiz (id, formation_id, titre, description, duree, score_requis, statut)
VALUES ('74bf8864-2c59-4fec-a11b-d6d9773f0e70', '77777777-7777-7777-7777-777777777777',
  'Évaluation C++', 'Quiz de validation des bases avancées de C++.', 15, 70, 'active');

INSERT INTO quiz_questions (id, quiz_id, question, type, ordre) VALUES
('a13eaabc-d6f5-4678-85a8-32d80d558605', '74bf8864-2c59-4fec-a11b-d6d9773f0e70', 'Quel mécanisme C++ permet de libérer automatiquement la mémoire allouée ?', 'multiple_choice', 1),
('fbba4224-3cc4-444b-9463-c4ff5e971b3e', '74bf8864-2c59-4fec-a11b-d6d9773f0e70', 'Quel mot-clé permet de définir une méthode redéfinissable dans une sous-classe ?', 'multiple_choice', 2),
('c19f65be-c0f0-4021-b915-7c27c1cce63f', '74bf8864-2c59-4fec-a11b-d6d9773f0e70', 'Quel opérateur permet d''allouer dynamiquement de la mémoire en C++ ?', 'multiple_choice', 3);

INSERT INTO quiz_answers (question_id, answer, est_correcte, ordre) VALUES
('a13eaabc-d6f5-4678-85a8-32d80d558605', 'Les smart pointers (RAII)', true, 1),
('a13eaabc-d6f5-4678-85a8-32d80d558605', 'Le garbage collector', false, 2),
('a13eaabc-d6f5-4678-85a8-32d80d558605', 'Rien, il n''y a pas de gestion automatique', false, 3),
('fbba4224-3cc4-444b-9463-c4ff5e971b3e', 'virtual', true, 1),
('fbba4224-3cc4-444b-9463-c4ff5e971b3e', 'static', false, 2),
('fbba4224-3cc4-444b-9463-c4ff5e971b3e', 'const', false, 3),
('c19f65be-c0f0-4021-b915-7c27c1cce63f', 'new', true, 1),
('c19f65be-c0f0-4021-b915-7c27c1cce63f', 'malloc', false, 2),
('c19f65be-c0f0-4021-b915-7c27c1cce63f', 'alloc', false, 3);
