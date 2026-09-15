const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export interface Formation {
  id: string;
  titre: string;
  description: string | null;
  categorie: string | null;
  niveau: string | null;
  duree: number | null;
  statut: string | null;
  modalite: 'presentiel' | 'e_learning' | string | null;
  created_at: string;
}

export interface FormationFilters {
  categorie?: string;
  niveau?: string;
  statut?: string;
  limit?: number;
  offset?: number;
}

export interface RecommandationFormation {
  formation_id: string;
  titre: string;
  description: string;
  categorie: string;
  niveau: string;
  duree: number;
  score_pertinence: number;
  competence_id: string;
  competence_nom: string;
  current_level: number;
  required_level: number;
  gap: number;
  motif: string;
}

async function apiGet<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
    });
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Erreur API ${res.status} sur ${path}`);
  return res.json();
}

async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Erreur API ${res.status} sur ${path}`);
  return res.json();
}

async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Erreur API ${res.status} sur ${path}`);
  return res.json();
}

export interface TrainingSession {
  id: string;
  formation_id: string;
  date_debut: string;
  date_fin: string;
  lieu: string | null;
  capacite: number | null;
  statut: string | null;
  places_restantes?: number | null;
}

export interface Enrollment {
  id: string;
  utilisateur_id: string;
  training_session_id: string;
  statut: string | null;
}

export const enrollmentsApi = {
  listForSession: (trainingSessionId: string, utilisateurId: string) =>
    apiGet<{ data: Enrollment[] }>('/enrollments', { training_session_id: trainingSessionId, utilisateur_id: utilisateurId, limit: 1 }),
  countForSession: (trainingSessionId: string) =>
    apiGet<{ total: number }>('/enrollments', { training_session_id: trainingSessionId, limit: 1 }),
};

export const trainingSessionsApi = {
  listByFormation: (formationId: string) =>
    apiGet<{ data: TrainingSession[]; total: number }>('/training-sessions', {
      formation_id: formationId,
      limit: 20,
    }),
  create: (session: {
    formation_id: string;
    date_debut: string;
    date_fin?: string;
    lieu?: string;
    capacite?: number;
    statut?: string;
  }) => apiPost<TrainingSession>('/training-sessions', session),
  update: (sessionId: string, session: Partial<TrainingSession>) =>
    apiPut<TrainingSession>(`/training-sessions/${sessionId}`, session),
};

  export interface MatrixData {
    utilisateurs: string[];
    employes?: { id: string; nom_complet: string }[];
  competences: { id: string; nom: string }[];
  cellules: { utilisateur_id: string; competence_id: string; niveau: number }[];
}

export interface CompetenceExpert {
  competence_id: string;
  competence_nom: string;
    experts: {
      utilisateur_id: string;
      nom_complet?: string;
    niveau: number;
    certifications: { nom: string; organisme: string; date_obtention: string }[];
  }[];
}

export interface EcartParPoste {
  poste_id: string;
  competences: {
    competence_id: string;
    competence_nom: string;
    niveau_requis: number;
    niveau_moyen_observe: number;
    ecart_moyen: number;
    collaborateurs_en_ecart: number;
    collaborateurs_evalues: number;
  }[];
}

export const competenceMapApi = {
  getMatrix: () => apiGet<MatrixData>('/employee-competences/matrix/all'),
  getTopExperts: (limit = 5) => apiGet<CompetenceExpert[]>('/employee-competences/experts/top', { limit }),
  listPostes: () => apiGet<string[]>('/competence-matrices/postes/liste'),
  getEcartsParPoste: (posteId: string) => apiGet<EcartParPoste>(`/competence-matrices/ecarts/${posteId}`),
};

export interface Quiz {
  id: string;
  formation_id: string;
  titre: string;
  description: string | null;
  score_requis: number;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  type: 'choix_unique' | 'choix_multiple' | string;
  ordre: number;
}

export interface QuizAnswerOption {
  id: string;
  question_id: string;
  answer: string;
  ordre: number;
}

export interface QuizAttemptResult {
  id: string;
  score: number;
  score_max: number;
  reussi: boolean;
  total_questions: number;
  bonnes_reponses: number;
}

export interface CertificationDetail {
  id: string;
  utilisateur_id: string;
  competence_id: string;
  nom_certification: string;
  organisme: string | null;
  date_obtention: string;
  date_expiration: string | null;
  formation: Formation | null;
  statistiques: {
    score_quiz: number | null;
    score_requis: number | null;
    date_passage: string | null;
    progression: number | null;
  };
  recommandations: Formation[];
}

export const quizApi = {
  listForFormation: (formationId: string) =>
    apiGet<{ data: Quiz[]; total: number }>('/quizzes', { formation_id: formationId, limit: 20 }),
  getById: (quizId: string) => apiGet<Quiz>(`/quizzes/${quizId}`),
  listQuestions: (quizId: string) =>
    apiGet<{ data: QuizQuestion[] }>('/quiz-questions', { quiz_id: quizId, limit: 100 }),
  listAnswers: (questionId: string) =>
    apiGet<{ data: QuizAnswerOption[] }>('/quiz-answers', { question_id: questionId, limit: 20 }),
  submitAttempt: (quizId: string, utilisateurId: string, reponses: { question_id: string; answer_ids: string[] }[]) =>
    apiPost<QuizAttemptResult>('/quiz-attempts', { quiz_id: quizId, utilisateur_id: utilisateurId, reponses }),
};

export const formationsApi = {
  list: (filters: FormationFilters) =>
    apiGet<Formation[]>('/formations', filters as Record<string, string | number | undefined>),
  getById: (id: string) => apiGet<Formation>(`/formations/${id}`),
  inscrire: (trainingSessionId: string, utilisateurId: string, details: { nomComplet: string; emailProfessionnel: string }) =>
    apiPost('/enrollments', {
      training_session_id: trainingSessionId,
      utilisateur_id: utilisateurId,
      date_inscription: new Date().toISOString(),
      statut: 'inscrit',
      nom_complet: details.nomComplet,
      email_professionnel: details.emailProfessionnel,
    }),
};

export const recommendationsApi = {
  getForUser: (utilisateurId: string, posteId: string) =>
    apiGet<{ recommandations: RecommandationFormation[] }>(
      `/competences/recommendations/${utilisateurId}`,
      { posteId },
    ),
};

export const certificationsApi = {
  getById: (id: string) => apiGet<CertificationDetail>(`/certifications/${id}`),
};
