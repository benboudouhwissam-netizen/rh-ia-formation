import { expect, request as playwrightRequest, test, type APIRequestContext } from '@playwright/test';

const API_URL = 'http://localhost:3000/api';
type ApiList<T> = T[] | { data: T[] };
const list = <T>(value: ApiList<T>) => (Array.isArray(value) ? value : value.data);

test.describe('Parcours E2E Formation, Compétences et Performance', () => {
  test('profil → écarts → recommandation → inscription → quiz → événements', async ({
    request,
  }) => {
    let utilisateurId: string;
    let api!: APIRequestContext;

    // Identifiants des ressources créées pendant le test, nettoyés en fin
    // de test quel que soit le résultat (succès ou échec d'une assertion).
    let quizId: string | undefined;
    let sessionId: string | undefined;
    let enrollmentId: string | undefined;

    try {
      // Le scénario utilise les routes métier protégées : créer d'abord
      // un vrai compte E2E et propager son token à toutes les requêtes.
      const postesResponse = await request.get(
        `${API_URL}/competence-matrices/postes/liste`,
      );
      expect(postesResponse.ok()).toBeTruthy();
      const postes = (await postesResponse.json()) as string[];
      expect(postes.length).toBeGreaterThan(0);

      const registerResponse = await request.post(`${API_URL}/auth/register`, {
        data: {
          nom_complet: 'Test E2E Maroc',
          email_professionnel: `e2e-${crypto.randomUUID()}@entreprise.ma`,
          mot_de_passe: 'MotDePasseE2E123!',
          poste_id: postes[0],
          type_contrat: 'CDI',
        },
      });
      expect(registerResponse.ok(), await registerResponse.text()).toBeTruthy();
      const authSession = (await registerResponse.json()) as {
        token: string;
        employee: { id: string };
      };
      utilisateurId = authSession.employee.id;
      api = await playwrightRequest.newContext({
        extraHTTPHeaders: { Authorization: `Bearer ${authSession.token}` },
      });

      const competencesResponse = await api.get(`${API_URL}/competences?limit=1`);
      expect(competencesResponse.ok()).toBeTruthy();
      const competences = list<{ id: string }>(await competencesResponse.json());
      expect(competences[0]?.id).toBeTruthy();

      const profileResponse = await api.post(`${API_URL}/employee-competences`, {
        data: {
          utilisateur_id: utilisateurId,
          competence_id: competences[0].id,
          niveau: 1,
          source: 'auto_evalue',
        },
      });
      expect(profileResponse.ok()).toBeTruthy();

      expect(
        (
          await api.get(
            `${API_URL}/competences/gaps/${utilisateurId}?posteId=${postes[0]}`,
          )
        ).ok(),
      ).toBeTruthy();

      const recommendationsResponse = await api.get(
        `${API_URL}/competences/recommendations/${utilisateurId}?posteId=${postes[0]}`,
      );
      expect(recommendationsResponse.ok()).toBeTruthy();
      const recommendations = (await recommendationsResponse.json()) as {
        recommandations: { formation_id: string }[];
      };
      expect(recommendations.recommandations.length).toBeGreaterThan(0);
      const formationId = recommendations.recommandations[0].formation_id;
      expect((await api.get(`${API_URL}/formations/${formationId}`)).ok()).toBeTruthy();

      const sessionResponse = await api.post(`${API_URL}/training-sessions`, {
        data: {
          formation_id: formationId,
          date_debut: '2030-01-01T09:00:00.000Z',
          date_fin: '2030-01-01T12:00:00.000Z',
          capacite: 20,
          statut: 'ouverte',
        },
      });
      const sessionBody = await sessionResponse.text();
      expect(sessionResponse.ok(), sessionBody).toBeTruthy();
      const session = JSON.parse(sessionBody) as { id: string };
      sessionId = session.id;

      const enrollmentResponse = await api.post(`${API_URL}/enrollments`, {
        data: {
          utilisateur_id: utilisateurId,
          training_session_id: session.id,
          date_inscription: new Date().toISOString(),
          statut: 'inscrit',
          nom_complet: 'Test E2E Maroc',
          email_professionnel: `e2e-${utilisateurId}@entreprise.ma`,
        },
      });
      expect(enrollmentResponse.ok()).toBeTruthy();
      const enrollment = (await enrollmentResponse.json()) as { id: string };
      enrollmentId = enrollment.id;

      const tasksResponse = await api.get(
        `${API_URL}/learning-tasks?utilisateur_id=${utilisateurId}`,
      );
      expect(tasksResponse.ok()).toBeTruthy();
      expect(
        (await tasksResponse.json()).some(
          (task: { type: string }) => task.type === 'suivre_formation',
        ),
      ).toBeTruthy();

      const enrollmentEventsResponse = await api.get(
        `${API_URL}/performance-events?utilisateur_id=${utilisateurId}`,
      );
      expect(enrollmentEventsResponse.ok()).toBeTruthy();
      expect(
        (await enrollmentEventsResponse.json()).some(
          (event: { type: string }) => event.type === 'inscription_formation',
        ),
      ).toBeTruthy();

      const linkResponse = await api.post(
        `${API_URL}/formations/${formationId}/competences/${competences[0].id}`,
        { data: { niveauVise: 2 } },
      );
      expect(linkResponse.ok(), await linkResponse.text()).toBeTruthy();

      const quizCreateResponse = await api.post(`${API_URL}/quizzes`, {
        data: {
          formation_id: formationId,
          titre: `Certification E2E ${utilisateurId}`,
          score_requis: 70,
          statut: 'active',
        },
      });
      expect(quizCreateResponse.ok()).toBeTruthy();
      const quiz = (await quizCreateResponse.json()) as { id: string };
      quizId = quiz.id;

      // Type aligné sur les 3 types canoniques utilisés partout ailleurs
      // dans le projet (multiple_choice / vrai_faux / reponse_libre),
      // plutôt que "choix_unique" qui n'existe nulle part ailleurs.
      const questionResponse = await api.post(`${API_URL}/quiz-questions`, {
        data: { quiz_id: quiz.id, question: 'Question E2E', type: 'multiple_choice', ordre: 1 },
      });
      expect(questionResponse.ok()).toBeTruthy();
      const question = (await questionResponse.json()) as { id: string };

      const correctAnswerResponse = await api.post(`${API_URL}/quiz-answers`, {
        data: { question_id: question.id, answer: 'Bonne réponse', est_correcte: true, ordre: 1 },
      });
      expect(correctAnswerResponse.ok()).toBeTruthy();
      const correctAnswer = (await correctAnswerResponse.json()) as { id: string };

      // Une deuxième option incorrecte, pour que la question ne soit pas
      // triviale à choix unique forcé — reflète mieux un vrai QCM.
      const wrongAnswerResponse = await api.post(`${API_URL}/quiz-answers`, {
        data: { question_id: question.id, answer: 'Mauvaise réponse', est_correcte: false, ordre: 2 },
      });
      expect(wrongAnswerResponse.ok()).toBeTruthy();

      const quizResponse = await api.post(`${API_URL}/quiz-attempts`, {
        data: {
          quiz_id: quiz.id,
          utilisateur_id: utilisateurId,
          reponses: [{ question_id: question.id, answer_ids: [correctAnswer.id] }],
        },
      });
      expect(quizResponse.ok()).toBeTruthy();
      const quizResult = (await quizResponse.json()) as {
        competences_updated: number;
        certifications_created: number;
      };
      expect(quizResult.competences_updated).toBeGreaterThan(0);
      expect(quizResult.certifications_created).toBeGreaterThan(0);

      // Vérification persistée : le profil, pas seulement la réponse du quiz,
      // reflète le niveau cible de la formation réussie.
      const updatedProfileResponse = await api.get(
        `${API_URL}/employee-competences/${utilisateurId}`,
      );
      expect(updatedProfileResponse.ok()).toBeTruthy();
      const updatedProfile = (await updatedProfileResponse.json()) as {
        competence_id: string;
        niveau: number;
        source: string;
      }[];
      expect(
        updatedProfile.some(
          (item) =>
            item.competence_id === competences[0].id &&
            item.niveau >= 2 &&
            item.source === 'quiz',
        ),
      ).toBeTruthy();

      const quizEventsResponse = await api.get(
        `${API_URL}/performance-events?utilisateur_id=${utilisateurId}`,
      );
      expect(quizEventsResponse.ok()).toBeTruthy();
      expect(
        (await quizEventsResponse.json()).some(
          (event: { type: string }) => event.type === 'quiz_termine',
        ),
      ).toBeTruthy();
    } finally {
      if (quizId) {
        await api.delete(`${API_URL}/quizzes/${quizId}`).catch(() => {});
      }
      if (enrollmentId) {
        await api.delete(`${API_URL}/enrollments/${enrollmentId}`).catch(() => {});
      }
      if (sessionId) {
        await api.delete(`${API_URL}/training-sessions/${sessionId}`).catch(() => {});
      }
      if (api) await api.dispose();
    }
  });
});
