'use client';

import { useParams } from 'next/navigation';
import { QuizPlayer } from '../../../components/formations/QuizPlayer';
import { AppShell } from '../../../components/ui/AppShell';
import { EmployeeAccess } from '../../../components/auth/EmployeeAccess';
import { useAuth } from '../../../components/auth/AuthProvider';

export default function QuizPage() {
  const params = useParams();
  const id = params.id as string;
  const { employee, ready } = useAuth();

  if (!ready) return <main className="grid min-h-screen place-items-center bg-brume font-body text-ardoise">Chargement de votre espace…</main>;
  if (!employee) return <EmployeeAccess />;

  return (
    <AppShell active="formations">
      <div className="mb-6 flex items-center justify-between border-b border-ardoise/12 pb-4">
        <p className="font-body text-sm text-ardoise">Formations <span className="mx-2">›</span> Évaluation <span className="mx-2">›</span> <span className="font-semibold text-encre">Quiz</span></p>
        <a href="/" className="rounded-lg border border-ardoise/40 px-3 py-2 font-body text-sm text-encre hover:bg-ardoise/10">Quitter le quiz</a>
      </div>
      <QuizPlayer quizId={id} utilisateurId={employee.id} employeeName={employee.nom_complet} />
    </AppShell>
  );
}
