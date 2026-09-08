import { expect, test } from '@playwright/test';

const quiz = {
  id: 'quiz-ui-test',
  titre: 'Quiz de sélection unique',
  description: 'Vérifie le comportement des réponses.',
  duree: 10,
  score_requis: 60,
};

const questions = [
  { id: 'question-qcm', quiz_id: quiz.id, question: 'Question à choix multiple', type: 'multiple_choice', ordre: 1 },
  { id: 'question-vf', quiz_id: quiz.id, question: 'Une affirmation est-elle vraie ?', type: 'vrai_faux', ordre: 2 },
];

const answers: Record<string, { id: string; answer: string }[]> = {
  'question-qcm': [
    { id: 'qcm-a', answer: 'Option A' },
    { id: 'qcm-b', answer: 'Option B' },
    { id: 'qcm-c', answer: 'Option C' },
  ],
  'question-vf': [
    { id: 'vf-true', answer: 'Vrai' },
    { id: 'vf-false', answer: 'Faux' },
  ],
};

const employee = {
  id: 'employee-ui-test',
  nom_complet: 'Employé de test',
  email_professionnel: 'test@example.com',
  poste_id: 'poste-ui-test',
};

test.beforeEach(async ({ page }) => {
  // La page du quiz est protégée : on simule une session déjà ouverte avant
  // le chargement de l'application, comme le ferait un utilisateur connecté.
  await page.addInitScript(({ profile }) => {
    window.localStorage.setItem('rh-ia-employee-session', JSON.stringify({
      token: 'token-ui-test', employee: profile,
    }));
  }, { profile: employee });

  await page.route('http://localhost:3000/api/**', async (route) => {
    const url = new URL(route.request().url());
    let body: unknown = {};

    if (url.pathname === `/api/quizzes/${quiz.id}`) body = quiz;
    if (url.pathname === '/api/auth/me') body = employee;
    if (url.pathname === '/api/quiz-questions') body = { data: questions };
    if (url.pathname === '/api/quiz-answers') {
      body = { data: answers[url.searchParams.get('question_id') ?? ''] ?? [] };
    }

    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) });
  });
});

test('QCM et vrai/faux conservent une seule réponse sélectionnée', async ({ page }) => {
  await page.goto(`/quiz/${quiz.id}`);

  const optionA = page.getByRole('button', { name: 'Option A' });
  const optionB = page.getByRole('button', { name: 'Option B' });
  await optionA.click();
  await optionB.click();

  await expect(optionA).toHaveAttribute('aria-pressed', 'false');
  await expect(optionB).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: 'Suivant' }).click();
  const vrai = page.getByRole('button', { name: 'Vrai' });
  const faux = page.getByRole('button', { name: 'Faux' });
  await vrai.click();
  await faux.click();

  await expect(vrai).toHaveAttribute('aria-pressed', 'false');
  await expect(faux).toHaveAttribute('aria-pressed', 'true');
});
