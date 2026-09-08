'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '../../../components/ui/AppShell';
import { EmployeeAccess } from '../../../components/auth/EmployeeAccess';
import { useAuth } from '../../../components/auth/AuthProvider';
import AISignature from '../../../components/ui/AISignature';
import { formationsApi, quizApi, type Formation, type Quiz } from '../../../lib/api';

type Chapter = { id: number; title: string; duration: number; description: string };

export default function ELearningPage() {
  const params = useParams();
  const router = useRouter();
  const { employee, ready } = useAuth();
  const formationId = typeof params?.id === 'string' ? params.id : null;
  const [formation, setFormation] = useState<Formation | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeChapter, setActiveChapter] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!formationId) return;
    Promise.allSettled([formationsApi.getById(formationId), quizApi.listForFormation(formationId)])
      .then(([formationResult, quizResult]) => {
        if (formationResult.status === 'rejected') {
          setError('Impossible de charger ce parcours e-learning.');
          return;
        }
        setFormation(formationResult.value);
        if (quizResult.status === 'fulfilled') setQuizzes(quizResult.value.data ?? []);
        else setQuizzes([]);
      })
      .finally(() => setLoading(false));
  }, [formationId]);

  useEffect(() => {
    if (!formationId || !employee) return;
    const key = `rh-ia-learning-progress-${employee.id}-${formationId}`;
    try {
      const saved = JSON.parse(window.localStorage.getItem(key) ?? '[]');
      if (Array.isArray(saved)) setCompleted(saved.filter((value): value is number => typeof value === 'number'));
    } catch { /* Une progression corrompue ne doit pas bloquer le module. */ }
    setProgressLoaded(true);
  }, [employee, formationId]);

  useEffect(() => {
    if (!formationId || !employee || !progressLoaded) return;
    window.localStorage.setItem(`rh-ia-learning-progress-${employee.id}-${formationId}`, JSON.stringify(completed));
  }, [completed, employee, formationId, progressLoaded]);

  const chapters = useMemo<Chapter[]>(() => {
    if (!formation) return [];
    return [
      { id: 0, title: `Introduction à ${formation.titre}`, duration: 15, description: formation.description ?? 'Découvrez les objectifs et les notions essentielles de cette formation.' },
      { id: 1, title: 'Concepts fondamentaux', duration: 20, description: 'Maîtrisez les concepts indispensables et le vocabulaire du module.' },
      { id: 2, title: 'Mise en pratique', duration: 25, description: 'Appliquez les connaissances acquises à des situations professionnelles concrètes.' },
      { id: 3, title: 'Synthèse et préparation au quiz', duration: 15, description: 'Révisez les points clés avant de passer l’évaluation finale.' },
    ];
  }, [formation]);

  const currentChapter = chapters[activeChapter];
  const progress = chapters.length ? Math.round((completed.length / chapters.length) * 100) : 0;
  const quiz = quizzes[0];
  const completeChapter = () => {
    setCompleted((current) => current.includes(activeChapter) ? current : [...current, activeChapter]);
    if (activeChapter < chapters.length - 1) setActiveChapter((current) => current + 1);
  };

  if (!ready) return <main className="grid min-h-screen place-items-center bg-brume font-body text-ardoise">Chargement…</main>;
  if (!employee) return <EmployeeAccess />;

  return <AppShell active="formations">
    <main className="mx-auto w-full max-w-[1440px]">
      {loading && <p className="py-16 text-center font-body text-ardoise">Chargement du module…</p>}
      {!loading && error && <p role="alert" className="rounded-lg border border-red-200 bg-white p-6 font-body text-red-700">{error}</p>}
      {!loading && formation && currentChapter && <>
        <nav className="mb-6 flex flex-wrap items-center gap-2 font-mono text-xs text-ardoise"><button onClick={() => router.push('/')} className="hover:text-sauge">Formations</button><span>›</span><span>{formation.categorie ?? 'Parcours'}</span><span>›</span><strong className="text-encre">{currentChapter.title}</strong></nav>
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-6">
            <header><p className="font-mono text-xs uppercase tracking-[0.16em] text-ardoise">Formation e-learning</p><h1 className="mt-2 font-heading text-3xl font-bold text-encre">{formation.titre}</h1><p className="mt-2 font-body text-lg text-ardoise">Progressez à votre rythme, puis validez vos acquis avec le quiz final.</p></header>
            <div className="relative aspect-video overflow-hidden rounded-xl border border-ardoise/15 bg-encre shadow-sm">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(62,124,116,.65),transparent_38%),linear-gradient(135deg,#1c2b39,#3e7c74)]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white"><div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-white/40 bg-white/15 text-4xl backdrop-blur-sm">{playing ? 'Ⅱ' : '▶'}</div><p className="font-heading text-xl font-semibold">{currentChapter.title}</p><p className="mt-2 max-w-md font-body text-sm text-white/80">Contenu vidéo et supports du chapitre · {currentChapter.duration} min</p><button onClick={() => setPlaying((value) => !value)} className="mt-5 rounded-md bg-white px-5 py-2 font-body text-sm font-semibold text-encre">{playing ? 'Mettre en pause' : 'Commencer le chapitre'}</button></div>
              <div className="absolute bottom-0 left-0 h-1 bg-white/20" style={{ width: '100%' }}><div className="h-full bg-primary-container" style={{ width: `${completed.includes(activeChapter) ? 100 : 35}%` }} /></div>
            </div>
            <div className="border-l-2 border-dashed border-ocre bg-ocre/5 p-6"><div className="mb-2 flex items-center justify-between"><AISignature /><span className="rounded bg-ocre px-2 py-0.5 font-mono text-[10px] font-bold text-white">IA</span></div><p className="font-body text-base italic text-encre">Concentrez-vous sur les exemples pratiques de ce chapitre. Ils vous aideront à réussir l’évaluation finale et à appliquer la compétence dans votre contexte professionnel.</p></div>
            <section className="rounded-xl border border-ardoise/15 bg-white p-6 shadow-sm"><h2 className="font-heading text-xl font-bold text-encre">{currentChapter.title}</h2><p className="mt-3 font-body leading-7 text-ardoise">{currentChapter.description}</p><div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ardoise/10 pt-5"><span className="font-mono text-xs text-ardoise">Chapitre {activeChapter + 1} sur {chapters.length}</span><button onClick={completeChapter} className="rounded-md bg-sauge px-5 py-2.5 font-body text-sm font-semibold text-white hover:bg-sauge-700">{completed.includes(activeChapter) ? 'Chapitre terminé' : 'Marquer comme terminé'}</button></div></section>
            <section className="rounded-xl border border-ardoise/15 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="font-mono text-xs uppercase tracking-widest text-ardoise">Évaluation finale</p><h2 className="mt-1 font-heading text-xl font-bold text-encre">Quiz de vérification des acquis</h2></div><span className="rounded-full bg-ocre/15 px-3 py-1 font-mono text-xs text-ocre-700">{quiz ? `${quiz.score_requis}% requis` : 'À venir'}</span></div><p className="mt-3 font-body text-sm text-ardoise">Validez tous les chapitres pour débloquer le quiz lié à cette formation. En cas de réussite, votre certificat sera généré automatiquement.</p>{quiz ? <button disabled={completed.length < chapters.length} onClick={() => router.push(`/quiz/${quiz.id}`)} className="mt-5 rounded-md bg-sauge px-5 py-2.5 font-body text-sm font-semibold text-white hover:bg-sauge-700 disabled:cursor-not-allowed disabled:bg-ardoise/40">{completed.length < chapters.length ? `Terminez encore ${chapters.length - completed.length} chapitre(s)` : 'Passer le quiz final'}</button> : <p className="mt-5 font-body text-sm text-ardoise">Le quiz de cette formation n’est pas encore disponible.</p>}</section>
          </section>
          <aside className="space-y-6"><section className="overflow-hidden rounded-xl border border-ardoise/15 bg-white shadow-sm"><div className="border-b border-ardoise/10 p-6"><h2 className="font-heading text-xl font-semibold text-encre">Sommaire du module</h2><p className="mt-2 font-mono text-xs uppercase tracking-wider text-ardoise">{chapters.length} chapitres · {formation.duree ?? '—'} min</p><div className="mt-4 h-2 rounded-full bg-brume"><div className="h-full rounded-full bg-sauge transition-all" style={{ width: `${progress}%` }} /></div><p className="mt-2 font-mono text-xs text-sauge">{progress}% terminé</p></div><div>{chapters.map((chapter) => <button key={chapter.id} onClick={() => setActiveChapter(chapter.id)} className={`flex w-full items-start gap-3 border-b border-ardoise/10 p-5 text-left transition ${activeChapter === chapter.id ? 'bg-sauge/5' : 'hover:bg-brume'}`}><span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${completed.includes(chapter.id) ? 'border-sauge bg-sauge text-white' : activeChapter === chapter.id ? 'border-sauge text-sauge' : 'border-ardoise/30 text-ardoise'}`}>{completed.includes(chapter.id) ? '✓' : chapter.id + 1}</span><span><strong className="block font-body text-sm text-encre">{chapter.title}</strong><small className="mt-1 block font-mono text-xs text-ardoise">{chapter.duration}:00 · {completed.includes(chapter.id) ? 'Terminé' : activeChapter === chapter.id ? 'En cours' : 'À découvrir'}</small></span></button>)}<div className="flex items-center gap-3 p-5 text-ardoise"><span className="text-xl">🔒</span><span><strong className="block font-body text-sm">Examen final</strong><small className="font-mono text-xs">Évaluation certificante</small></span></div></div></section>{quiz && <button disabled={completed.length < chapters.length} onClick={() => router.push(`/quiz/${quiz.id}`)} className="w-full rounded-md bg-sauge px-4 py-3 font-body font-semibold text-white hover:bg-sauge-700 disabled:cursor-not-allowed disabled:bg-ardoise/40">{completed.length < chapters.length ? 'Terminez les chapitres pour accéder au quiz' : 'Passer le quiz final'}</button>}</aside>
        </div>
      </>}
    </main>
  </AppShell>;
}
