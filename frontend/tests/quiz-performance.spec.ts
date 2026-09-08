import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000/api';

test.describe('Quiz et résultats', () => {
  test('récupérer un quiz, ses questions, et soumettre une tentative', async ({
    request,
  }) => {
    // 1. Récupérer la liste des quiz
    const quizzesResponse = await request.get(`${API_URL}/quizzes`);
    expect(quizzesResponse.ok()).toBeTruthy();

    const quizzesBody = await quizzesResponse.json();
    const quizzes = quizzesBody.data ?? quizzesBody;
    expect(quizzes.length).toBeGreaterThan(0);

    // On prend un quiz qui a des questions et des réponses complètes
    // (le quiz NestJS seedé via migration_quiz_complete.sql en a toujours)
    const quiz = quizzes.find((q: any) => q.titre === 'Évaluation NestJS') ?? quizzes[0];
    expect(quiz.id).toBeDefined();

    // 2. Récupérer les questions du quiz
    const questionsResponse = await request.get(
      `${API_URL}/quiz-questions?quiz_id=${quiz.id}&limit=50`,
    );
    expect(questionsResponse.ok()).toBeTruthy();

    const questionsBody = await questionsResponse.json();
    const questions = questionsBody.data ?? questionsBody;
    expect(questions.length).toBeGreaterThan(0);

    // 3. Pour chaque question, récupérer ses réponses possibles et
    // construire une réponse (on choisit toujours la bonne réponse
    // pour vérifier que le score calculé est cohérent).
    const reponses = [];

    for (const question of questions) {
      if (question.type === 'reponse_libre') {
        const answersResponse = await request.get(
          `${API_URL}/quiz-answers?question_id=${question.id}`,
        );
        expect(answersResponse.ok()).toBeTruthy();

        const answersBody = await answersResponse.json();
        const answers = answersBody.data ?? answersBody;
        const bonneReponse = answers.find((a: any) => a.est_correcte);

        reponses.push({
          question_id: question.id,
          texte_libre: bonneReponse?.answer ?? '',
        });
      } else {
        const answersResponse = await request.get(
          `${API_URL}/quiz-answers?question_id=${question.id}`,
        );
        expect(answersResponse.ok()).toBeTruthy();

        const answersBody = await answersResponse.json();
        const answers = answersBody.data ?? answersBody;
        const bonnesReponses = answers.filter((a: any) => a.est_correcte);

        reponses.push({
          question_id: question.id,
          answer_ids: bonnesReponses.map((a: any) => a.id),
        });
      }
    }

    // 4. Soumettre la tentative avec toutes les bonnes réponses
    const submitResponse = await request.post(`${API_URL}/quiz-attempts`, {
      data: {
        quiz_id: quiz.id,
        utilisateur_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        reponses,
      },
    });

    expect(submitResponse.ok()).toBeTruthy();

    const result = await submitResponse.json();

    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('score_max');
    expect(result).toHaveProperty('reussi');
    expect(result).toHaveProperty('total_questions');
    expect(result).toHaveProperty('bonnes_reponses');
    expect(result).toHaveProperty('detail');

    expect(result.total_questions).toBe(questions.length);

    // Puisqu'on a soumis toutes les bonnes réponses, le score doit être maximal
    expect(result.bonnes_reponses).toBe(questions.length);
    expect(result.score).toBe(100);
    expect(result.reussi).toBe(true);

    // Chaque entrée du détail doit être marquée correcte
    expect(
      result.detail.every((d: any) => d.correcte === true),
    ).toBeTruthy();
  });

  test('soumettre un quiz avec de mauvaises réponses donne un score bas', async ({
    request,
  }) => {
    const quizzesResponse = await request.get(`${API_URL}/quizzes`);
    const quizzesBody = await quizzesResponse.json();
    const quizzes = quizzesBody.data ?? quizzesBody;

    const quiz = quizzes.find((q: any) => q.titre === 'Évaluation NestJS') ?? quizzes[0];

    const questionsResponse = await request.get(
      `${API_URL}/quiz-questions?quiz_id=${quiz.id}&limit=50`,
    );
    const questionsBody = await questionsResponse.json();
    const questions = questionsBody.data ?? questionsBody;

    // On soumet des réponses vides/incorrectes pour toutes les questions
    const reponses = questions.map((question: any) => ({
      question_id: question.id,
      texte_libre:
        question.type === 'reponse_libre' ? 'réponse volontairement fausse' : undefined,
      answer_ids: question.type !== 'reponse_libre' ? [] : undefined,
    }));

    const submitResponse = await request.post(`${API_URL}/quiz-attempts`, {
      data: {
        quiz_id: quiz.id,
        utilisateur_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        reponses,
      },
    });

    expect(submitResponse.ok()).toBeTruthy();

    const result = await submitResponse.json();

    expect(result.bonnes_reponses).toBe(0);
    expect(result.score).toBe(0);
    expect(result.reussi).toBe(false);
  });
});