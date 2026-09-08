'use client';

// components/QuizPlayer.tsx
//
// Interface de passage de quiz : affichage des questions une par une,
// capture des réponses (choix multiples, vrai/faux, réponse libre),
// soumission, puis écran de résultats avec score et détail par question.
//
// La notation est calculée côté backend (quiz-attempts.service.ts) ;
// ce composant ne fait qu'afficher ce que l'API renvoie.
//
// Design tokens — Design System RH IA (Lot 11) :
//   Encre   #1C2B39   texte principal
//   Brume   #EDF1F0   fond
//   Sauge   #3E7C74   accent principal / succès
//   Ocre    #C89B3C   accent IA
//   Ardoise #6B7680   texte secondaire / bordures (12% opacité)
//   Titres  : Space Grotesk   Texte/UI : IBM Plex Sans   Data : IBM Plex Mono
//
// Ces polices sont supposées chargées globalement via next/font dans le
// layout de l'app, exposées comme variables CSS --font-heading /
// --font-body / --font-mono. Adapte si ta config diffère.

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  getQuiz,
  getQuizQuestions,
  getQuestionAnswers,
  submitQuizAttempt,
} from '../../lib/quiz-api';
import type {
  Quiz,
  QuizQuestion,
  QuizAnswerOption,
  UserResponse,
  QuizAttemptResult,
} from '../../types/quiz';

const COLORS = {
  encre: '#1C2B39',
  brume: '#EDF1F0',
  sauge: '#3E7C74',
  ocre: '#C89B3C',
  ardoise: '#6B7680',
  alerte: '#B0483F',
  selection: '#0066FF',
};

type LoadState = 'loading' | 'ready' | 'error';
type Phase = 'playing' | 'submitting' | 'results';

interface QuizPlayerProps {
  quizId: string;
  utilisateurId: string;
  employeeName?: string;
  onExit?: () => void;
}

export function QuizPlayer({ quizId, utilisateurId, employeeName, onExit }: QuizPlayerProps) {
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [error, setError] = useState<string | null>(null);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answersByQuestion, setAnswersByQuestion] = useState<
    Record<string, QuizAnswerOption[]>
  >({});

  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, UserResponse>>({});
  const [phase, setPhase] = useState<Phase>('playing');
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  // Chargement initial : quiz + questions + réponses possibles par question
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoadState('loading');
        const quizData = await getQuiz(quizId);
        const questionData = await getQuizQuestions(quizId);

        const answerEntries = await Promise.all(
          questionData
            .filter((q) => q.type !== 'reponse_libre')
            .map(async (q) => [q.id, await getQuestionAnswers(q.id)] as const),
        );

        if (cancelled) return;

        setQuiz(quizData);
        setQuestions(questionData);
        setAnswersByQuestion(Object.fromEntries(answerEntries));
        setRemainingSeconds(quizData.duree ? quizData.duree * 60 : null);
        setLoadState('ready');
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Erreur de chargement du quiz');
        setLoadState('error');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [quizId]);

  // Minuteur — soumet automatiquement à zéro
  useEffect(() => {
    if (remainingSeconds === null || phase !== 'playing') return;
    if (remainingSeconds <= 0) {
      handleSubmit();
      return;
    }
    const timer = setTimeout(() => setRemainingSeconds((s) => (s ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds, phase]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(responses).length;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  function setSingleChoice(questionId: string, answerId: string) {
    setResponses((prev) => ({
      ...prev,
      [questionId]: { question_id: questionId, answer_ids: [answerId] },
    }));
  }

  function setFreeText(questionId: string, texte: string) {
    setResponses((prev) => ({
      ...prev,
      [questionId]: { question_id: questionId, texte_libre: texte },
    }));
  }

  async function handleSubmit() {
    if (!quiz) return;
    setPhase('submitting');
    try {
      const attemptResult = await submitQuizAttempt({
        quiz_id: quiz.id,
        utilisateur_id: utilisateurId,
        reponses: Object.values(responses),
      });
      setResult(attemptResult);
      window.dispatchEvent(new Event('rh-notifications-refresh'));
      setPhase('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la soumission');
      setPhase('playing');
    }
  }

  const timeLabel = useMemo(() => {
    if (remainingSeconds === null) return null;
    const m = Math.floor(remainingSeconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (remainingSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, [remainingSeconds]);

  // ---------- États de chargement / erreur ----------

  if (loadState === 'loading') {
    return (
      <div style={styles.centeredScreen}>
        <p style={{ ...styles.mono, color: COLORS.ardoise }}>Chargement du quiz…</p>
      </div>
    );
  }

  if (loadState === 'error' || !quiz) {
    return (
      <div style={styles.centeredScreen}>
        <div style={{ ...styles.card, maxWidth: 420, textAlign: 'center' }}>
          <p style={{ ...styles.body, color: COLORS.encre, marginBottom: 8 }}>
            Impossible de charger ce quiz.
          </p>
          <p style={{ ...styles.mono, fontSize: 13, color: COLORS.ardoise }}>{error}</p>
        </div>
      </div>
    );
  }

  if (totalQuestions === 0) {
    return (
      <div style={styles.centeredScreen}>
        <div style={{ ...styles.card, maxWidth: 420, textAlign: 'center' }}>
          <p style={{ ...styles.title, fontSize: 18, color: COLORS.encre, marginBottom: 8 }}>
            {quiz.titre}
          </p>
          <p style={{ ...styles.body, color: COLORS.ardoise }}>
            Ce quiz ne contient encore aucune question. Ajoute des questions depuis
            l&apos;administration des formations avant de le proposer aux collaborateurs.
          </p>
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              style={{ ...styles.secondaryButton, marginTop: 16 }}
            >
              Retour
            </button>
          )}
        </div>
      </div>
    );
  }

  // ---------- Écran de résultats ----------

  if (phase === 'results' && result) {
    return (
      <ResultsScreen
        quiz={quiz}
        result={result}
        questions={questions}
        answersByQuestion={answersByQuestion}
        employeeName={employeeName}
        onExit={onExit}
      />
    );
  }

  // ---------- Passage du quiz ----------

  return (
    <div style={{ ...styles.page, fontFamily: 'var(--font-body, IBM Plex Sans, sans-serif)' }}>
      <div style={styles.container}>
        {/* En-tête : titre, minuteur, progression */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>{quiz.titre}</h1>
            {quiz.description && (
              <p style={{ ...styles.body, color: COLORS.ardoise, marginTop: 4 }}>
                {quiz.description}
              </p>
            )}
          </div>
          {timeLabel && (
            <div style={styles.timerBadge}>
              <span style={styles.mono}>{timeLabel}</span>
            </div>
          )}
        </header>

        <ProgressBar current={currentIndex + 1} total={totalQuestions} progress={progress} />

        {/* Carte question */}
        {currentQuestion && (
          <div style={styles.card}>
            <p style={{ ...styles.mono, fontSize: 13, color: COLORS.ardoise, marginBottom: 12 }}>
              Question {currentIndex + 1} / {totalQuestions}
            </p>
            <p style={styles.questionText}>{currentQuestion.question}</p>

            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentQuestion.type === 'reponse_libre' ? (
                <textarea
                  value={responses[currentQuestion.id]?.texte_libre ?? ''}
                  onChange={(e) => setFreeText(currentQuestion.id, e.target.value)}
                  placeholder="Écris ta réponse ici…"
                  rows={4}
                  style={styles.textarea}
                />
              ) : (answersByQuestion[currentQuestion.id] ?? []).length === 0 ? (
                <p style={{ ...styles.body, color: COLORS.ardoise, fontStyle: 'italic' }}>
                  Aucune réponse n&apos;est encore configurée pour cette question. Ajoute des
                  options de réponse depuis l&apos;administration du quiz avant de le publier.
                </p>
              ) : (
                (answersByQuestion[currentQuestion.id] ?? []).map((option) => {
                  const selected =
                    responses[currentQuestion.id]?.answer_ids?.includes(option.id) ?? false;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setSingleChoice(currentQuestion.id, option.id)}
                      style={{
                        ...styles.optionButton,
                        // Bleu de sélection : distinct du vert réservé aux bonnes réponses.
                        borderColor: selected ? COLORS.selection : `${COLORS.ardoise}1F`,
                        backgroundColor: selected ? `${COLORS.selection}0D` : '#FFFFFF',
                      }}
                    >
                      <span
                        style={{
                          ...styles.optionMarker,
                          borderColor: selected ? COLORS.selection : COLORS.ardoise,
                          backgroundColor: selected ? COLORS.selection : 'transparent',
                        }}
                      />
                      <span style={{ ...styles.body, color: COLORS.encre }}>{option.answer}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={styles.navRow}>
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            style={{
              ...styles.secondaryButton,
              opacity: currentIndex === 0 ? 0.4 : 1,
              cursor: currentIndex === 0 ? 'default' : 'pointer',
            }}
          >
            Précédent
          </button>

          {currentIndex < totalQuestions - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
              style={styles.primaryButton}
            >
              Suivant
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={phase === 'submitting'}
              style={styles.primaryButton}
            >
              {phase === 'submitting' ? 'Envoi en cours…' : 'Valider le quiz'}
            </button>
          )}
        </div>

        {error && (
          <p style={{ ...styles.body, color: COLORS.alerte, marginTop: 12 }}>{error}</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sous-composants
// ---------------------------------------------------------------------------

function ProgressBar({
  current,
  total,
  progress,
}: {
  current: number;
  total: number;
  progress: number;
}) {
  return (
    <div style={{ margin: '16px 0 24px' }}>
      <div style={styles.progressTrack}>
        <div
          style={{
            ...styles.progressFill,
            width: `${(current / Math.max(total, 1)) * 100}%`,
          }}
        />
      </div>
      <p style={{ ...styles.mono, fontSize: 12, color: COLORS.ardoise, marginTop: 6 }}>
        {Math.round(progress)}% des questions renseignées
      </p>
    </div>
  );
}

function ResultsScreen({
  quiz,
  result,
  questions,
  answersByQuestion,
  employeeName,
  onExit,
}: {
  quiz: Quiz;
  result: QuizAttemptResult;
  questions: QuizQuestion[];
  answersByQuestion: Record<string, QuizAnswerOption[]>;
  employeeName?: string;
  onExit?: () => void;
}) {
  const statusColor = result.reussi ? COLORS.sauge : COLORS.ardoise;

  return (
    <div style={{ ...styles.page, fontFamily: 'var(--font-body, IBM Plex Sans, sans-serif)' }}>
      <div style={styles.container}>
        <div style={{ ...styles.card, textAlign: 'center', padding: '40px 24px' }}>
          <ScoreRing score={result.score} color={statusColor} />

          <p
            style={{
              ...styles.title,
              fontSize: 22,
              color: statusColor,
              marginTop: 16,
            }}
          >
            {result.reussi ? 'Formation validée' : 'Score insuffisant'}
          </p>
          <p style={{ ...styles.body, color: COLORS.ardoise, marginTop: 4 }}>
            Score obtenu : {result.score}% · {result.bonnes_reponses} / {result.total_questions} bonnes réponses
            {quiz.score_requis != null && ` — seuil de réussite : ${quiz.score_requis}%`}
          </p>
        </div>

        {result.reussi && (
          <div style={{ ...styles.card, marginTop: 18, padding: '20px 24px', borderLeft: `3px solid ${COLORS.sauge}` }}>
            <p style={{ ...styles.mono, color: COLORS.sauge, fontSize: 12 }}>CERTIFICAT DÉLIVRÉ</p>
            <p style={{ ...styles.title, color: COLORS.encre, fontSize: 18, marginTop: 8 }}>Certificat de réussite</p>
            <p style={{ ...styles.body, color: COLORS.ardoise, marginTop: 6 }}>Décerné à {employeeName ?? 'vous'} pour la validation de « {quiz.titre} ». Il est disponible dans « Mes formations ».</p>
          </div>
        )}

        {/* Détail par question */}
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {questions.map((q, idx) => {
            const detail = result.detail.find((d) => d.question_id === q.id);
            const options = answersByQuestion[q.id] ?? [];
            const attendues = detail?.reponses_attendues
              .map((id) => options.find((o) => o.id === id)?.answer)
              .filter(Boolean);

            return (
              <div
                key={q.id}
                style={{
                  ...styles.card,
                  padding: '16px 20px',
                  borderLeft: `3px solid ${detail?.correcte ? COLORS.sauge : COLORS.alerte}`,
                }}
              >
                <p style={{ ...styles.mono, fontSize: 12, color: COLORS.ardoise }}>
                  Question {idx + 1}
                  {'  '}
                  <span style={{ color: detail?.correcte ? COLORS.sauge : COLORS.alerte }}>
                    {detail?.correcte ? '✓ correcte' : '✕ incorrecte'}
                  </span>
                </p>
                <p style={{ ...styles.body, color: COLORS.encre, marginTop: 4 }}>{q.question}</p>
                {!detail?.correcte && attendues && attendues.length > 0 && (
                  <p style={{ ...styles.body, fontSize: 14, color: COLORS.ardoise, marginTop: 6 }}>
                    Réponse attendue : {attendues.join(', ')}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {onExit && (
          <button type="button" onClick={onExit} style={{ ...styles.primaryButton, marginTop: 24 }}>
            Retour à la formation
          </button>
        )}
      </div>
    </div>
  );
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(score, 100) / 100) * circumference;

  return (
    <svg width={140} height={140} viewBox="0 0 140 140">
      <circle
        cx={70}
        cy={70}
        r={radius}
        fill="none"
        stroke={`${COLORS.ardoise}1F`}
        strokeWidth={10}
      />
      <circle
        cx={70}
        cy={70}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 70 70)"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text
        x="70"
        y="76"
        textAnchor="middle"
        style={{
          fontFamily: 'var(--font-mono, IBM Plex Mono, monospace)',
          fontSize: 28,
          fill: COLORS.encre,
        }}
      >
        {Math.round(score)}%
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  page: {
    backgroundColor: COLORS.brume,
    minHeight: '100vh',
    padding: '8px 0 32px',
  },
  container: {
    maxWidth: 920,
    margin: '0 auto',
  },
  centeredScreen: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.brume,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    fontFamily: 'var(--font-heading, Space Grotesk, sans-serif)',
    fontSize: 40,
    fontWeight: 700,
    color: COLORS.encre,
    margin: 0,
  },
  body: {
    fontFamily: 'var(--font-body, IBM Plex Sans, sans-serif)',
    fontSize: 15,
    lineHeight: 1.5,
    margin: 0,
  },
  mono: {
    fontFamily: 'var(--font-mono, IBM Plex Mono, monospace)',
  },
  timerBadge: {
    backgroundColor: '#FFFFFF',
    border: `1px solid ${COLORS.ardoise}1F`,
    borderRadius: 8,
    padding: '6px 12px',
    color: COLORS.encre,
    fontSize: 14,
    whiteSpace: 'nowrap',
  },
  card: {
    backgroundColor: '#FFFFFF',
    border: `1px solid ${COLORS.ardoise}1F`,
    borderRadius: 8,
    padding: 24,
  },
  questionText: {
    fontFamily: 'var(--font-heading, Space Grotesk, sans-serif)',
    fontSize: 18,
    fontWeight: 500,
    color: COLORS.encre,
    margin: 0,
    lineHeight: 1.4,
  },
  optionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'border-color 0.15s ease, background-color 0.15s ease',
  },
  optionMarker: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: '2px solid',
    flexShrink: 0,
  },
  textarea: {
    fontFamily: 'var(--font-body, IBM Plex Sans, sans-serif)',
    fontSize: 15,
    padding: 12,
    borderRadius: 8,
    border: `1px solid ${COLORS.ardoise}33`,
    resize: 'vertical',
  },
  navRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: COLORS.sauge,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 8,
    padding: '12px 24px',
    fontSize: 15,
    fontFamily: 'var(--font-body, IBM Plex Sans, sans-serif)',
    cursor: 'pointer',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: COLORS.encre,
    border: `1px solid ${COLORS.ardoise}33`,
    borderRadius: 8,
    padding: '12px 24px',
    fontSize: 15,
    fontFamily: 'var(--font-body, IBM Plex Sans, sans-serif)',
  },
  progressTrack: {
    height: 6,
    borderRadius: 4,
    backgroundColor: `${COLORS.ardoise}1F`,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.sauge,
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
};
