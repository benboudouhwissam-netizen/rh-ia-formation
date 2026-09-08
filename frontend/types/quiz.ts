// types/quiz.ts
// Types partagés pour le module Quiz (catalogue de formation IA — Lot 8)

export type QuestionType = 'multiple_choice' | 'vrai_faux' | 'reponse_libre';

export interface Quiz {
  id: string;
  formation_id: string;
  titre: string;
  description: string | null;
  duree: number | null; // en minutes
  score_requis: number | null; // seuil de réussite en %
  statut: string | null;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  type: QuestionType;
  ordre: number | null;
}

// Version "sûre" d'une réponse, sans le champ est_correcte,
// à ne jamais exposer avant la soumission du quiz.
export interface QuizAnswerOption {
  id: string;
  question_id: string;
  answer: string;
  ordre: number | null;
}

// Réponse brute telle que renvoyée par GET /api/quiz-answers (contient est_correcte).
// Utilisée uniquement en interne, jamais transmise telle quelle au JSX.
export interface QuizAnswerRaw extends QuizAnswerOption {
  est_correcte: boolean;
}

// Ce que l'utilisateur a sélectionné/saisi pour une question donnée
export interface UserResponse {
  question_id: string;
  answer_ids?: string[]; // choix multiples / vrai-faux
  texte_libre?: string; // réponse libre
}

export interface SubmitQuizAttemptPayload {
  quiz_id: string;
  utilisateur_id: string;
  reponses: UserResponse[];
}

// Réponse renvoyée par POST /api/quiz-attempts (voir quiz-attempts.service.ts)
export interface QuizAttemptResultDetail {
  question_id: string;
  correcte: boolean;
  reponses_attendues: string[];
  reponses_soumises: string[];
}

export interface QuizAttemptResult {
  id: string;
  quiz_id: string;
  utilisateur_id: string;
  score: number; // pourcentage 0-100
  score_max: number; // toujours 100 côté backend actuel
  reussi: boolean;
  date_passage: string;
  total_questions: number;
  bonnes_reponses: number;
  detail: QuizAttemptResultDetail[];
}