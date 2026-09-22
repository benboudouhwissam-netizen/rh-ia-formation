// lib/quiz-api.ts
// Appels API pour le module Quiz. Adapte API_BASE_URL à ta config d'env
// (ex: process.env.NEXT_PUBLIC_API_URL).

import type {
  Quiz,
  QuizQuestion,
  QuizAnswerOption,
  QuizAnswerRaw,
  SubmitQuizAttemptPayload,
  QuizAttemptResult,
} from '../types/quiz';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

/** Ajoute le jeton de session aux appels qui nécessitent l'authentification. */
function authHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem('rh-ia-employee-session');
    const token = raw ? (JSON.parse(raw) as { token?: string }).token : undefined;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Erreur ${res.status} sur ${url}`);
  }

  return res.json();
}

export async function getQuiz(quizId: string): Promise<Quiz> {
  return fetchJson<Quiz>(`${API_BASE_URL}/quizzes/${quizId}`);
}

export async function getQuizQuestions(quizId: string): Promise<QuizQuestion[]> {
  const result = await fetchJson<{ data: QuizQuestion[] }>(
    `${API_BASE_URL}/quiz-questions?quiz_id=${quizId}&limit=100`,
  );
  return result.data.sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));
}

// IMPORTANT : l'endpoint /quiz-answers renvoie aussi est_correcte.
// On le retire ici, avant que la réponse n'atteigne l'UI, pour ne jamais
// exposer la bonne réponse dans le réseau pendant que l'utilisateur passe le quiz.
// À terme, préférer un endpoint backend dédié qui ne renvoie jamais ce champ
// avant soumission (ex: GET /quiz-questions/:id/answers-public).
export async function getQuestionAnswers(
  questionId: string,
): Promise<QuizAnswerOption[]> {
  const result = await fetchJson<{ data: QuizAnswerRaw[] }>(
    `${API_BASE_URL}/quiz-answers?question_id=${questionId}&limit=20`,
  );

  return result.data
    .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
    .map(({ id, question_id, answer, ordre }) => ({ id, question_id, answer, ordre }));
}

export async function submitQuizAttempt(
  payload: SubmitQuizAttemptPayload,
): Promise<QuizAttemptResult> {
  return fetchJson<QuizAttemptResult>(`${API_BASE_URL}/quiz-attempts`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
