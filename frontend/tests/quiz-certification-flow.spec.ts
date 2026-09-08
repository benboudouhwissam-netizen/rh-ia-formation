import { expect, test } from '@playwright/test';

const API_URL = 'http://localhost:3000/api';
const QUIZ_ID = 'a20281ee-d606-4cdc-8cdf-7c4b5fdbbf12';
const POSTE_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

test('un quiz validé met à jour le profil et délivre un certificat au salarié', async ({ request }) => {
  const email = `quiz-cert-${crypto.randomUUID()}@entreprise.ma`;
  const accountResponse = await request.post(`${API_URL}/auth/register`, {
    data: { nom_complet: 'Khadija Ait Lahcen', email_professionnel: email, mot_de_passe: 'MotDePasse123!', poste_id: POSTE_ID },
  });
  expect(accountResponse.ok(), await accountResponse.text()).toBeTruthy();
  const account = await accountResponse.json() as { employee: { id: string } };

  const questionsResponse = await request.get(`${API_URL}/quiz-questions?quiz_id=${QUIZ_ID}&limit=50`);
  expect(questionsResponse.ok()).toBeTruthy();
  const questions = ((await questionsResponse.json()).data ?? []) as { id: string; type: string }[];
  const reponses = [] as unknown[];
  for (const question of questions) {
    const answersResponse = await request.get(`${API_URL}/quiz-answers?question_id=${question.id}`);
    expect(answersResponse.ok()).toBeTruthy();
    const answers = ((await answersResponse.json()).data ?? []) as { id: string; answer: string; est_correcte: boolean }[];
    const correct = answers.filter((answer) => answer.est_correcte);
    reponses.push(question.type === 'reponse_libre'
      ? { question_id: question.id, texte_libre: correct[0]?.answer }
      : { question_id: question.id, answer_ids: correct.map((answer) => answer.id) });
  }

  const submitResponse = await request.post(`${API_URL}/quiz-attempts`, {
    data: { quiz_id: QUIZ_ID, utilisateur_id: account.employee.id, reponses },
  });
  expect(submitResponse.ok(), await submitResponse.text()).toBeTruthy();
  const result = await submitResponse.json() as { reussi: boolean; competences_updated: number; certifications_created: number };
  expect(result.reussi).toBeTruthy();
  expect(result.competences_updated).toBeGreaterThan(0);
  expect(result.certifications_created).toBeGreaterThan(0);

  const profileResponse = await request.get(`${API_URL}/employee-competences/${account.employee.id}`);
  expect(profileResponse.ok()).toBeTruthy();
  expect((await profileResponse.json()).some((item: { source: string; niveau: number }) => item.source === 'quiz' && item.niveau >= 2)).toBeTruthy();

  const certificationsResponse = await request.get(`${API_URL}/certifications/utilisateur/${account.employee.id}`);
  expect(certificationsResponse.ok()).toBeTruthy();
  const certifications = await certificationsResponse.json() as { nom_certification: string }[];
  expect(certifications.some((item) => item.nom_certification.includes('Évaluation des compétences professionnelles'))).toBeTruthy();
});
