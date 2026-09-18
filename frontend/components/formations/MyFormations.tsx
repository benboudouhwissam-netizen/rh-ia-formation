'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../auth/AuthProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';
function sessionHeaders(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem('rh-ia-employee-session');
    const token = raw ? (JSON.parse(raw) as { token?: string }).token : undefined;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}
type Enrollment = {
  id: string;
  statut: string;
  training_session: { formation_id: string; date_debut: string; lieu?: string | null; formation?: { titre: string; duree?: number | null; modalite?: string | null } };
};
type Certification = { id: string; nom_certification: string; date_obtention: string; formation_id?: string | null };

const isFormationTerminee = (statut: string, formationId: string, certifications: Certification[]) =>
  ['termine', 'terminée', 'certifie', 'certifié', 'completed'].includes(statut.toLowerCase()) || certifications.some((item) => item.formation_id === formationId);

export function MyFormations({ onClose }: { onClose: () => void }) {
  const { employee } = useAuth();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  useEffect(() => {
    if (!employee) return;
    fetch(`${API_URL}/enrollments?utilisateur_id=${employee.id}&limit=50`, { headers: sessionHeaders() }).then((r) => r.json()).then((data) => setEnrollments((current) => [...(data.data ?? []), ...current.filter((item) => item.id.startsWith('cert-'))])).catch(() => setEnrollments([]));
      fetch(`${API_URL}/certifications/utilisateur/${employee.id}`, { headers: sessionHeaders() }).then((r) => r.json()).then(async (data) => {
        const items: Certification[] = data.data ?? data ?? [];
        // Compatibilité avec d'anciennes données éventuellement dupliquées.
        // L'API est désormais protégée par une contrainte unique, mais cette
        // déduplication évite d'afficher deux cartes pendant la migration.
        const unique = Array.from(new Map(items.map((item) => [`${item.nom_certification}|${item.date_obtention}`, item])).values());
        setCertifications(unique);
        const completed = await Promise.all(unique.filter((item) => item.formation_id).map(async (item) => {
          try {
            const response = await fetch(`${API_URL}/formations/${item.formation_id}`, { headers: sessionHeaders() });
            if (!response.ok) return null;
            const formation = await response.json();
            return { id: `cert-${item.id}`, statut: 'terminee', training_session: { formation_id: item.formation_id, date_debut: item.date_obtention, formation } } as Enrollment;
          } catch {
            return null;
          }
        }));
        setEnrollments((current) => [...current, ...completed.filter((item): item is Enrollment => item !== null && !current.some((existing) => existing.training_session.formation_id === item.training_session.formation_id))]);
      }).catch(() => setCertifications([]));
  }, [employee]);
  const completed = certifications.length;
  const total = enrollments.length + certifications.length;
  const progress = total ? Math.min(100, Math.round((completed / total) * 100)) : 0;

  return (
    <section>
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ardoise">Learning&nbsp;&nbsp;/&nbsp;&nbsp; My journey</p>
          <h2 className="mt-2 font-heading text-h2 text-encre">Mon parcours de formation</h2>
        </div>
        <div className="w-full rounded-lg border border-ardoise/12 bg-white p-4 md:w-80">
          <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.12em] text-ardoise"><span>Progression globale</span><span className="text-sauge-700">{progress}%</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-ardoise/10"><div className="h-full bg-sauge transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
      </div>

      <div className="relative grid gap-8 lg:grid-cols-2 lg:before:absolute lg:before:bottom-0 lg:before:left-1/2 lg:before:top-0 lg:before:w-px lg:before:bg-ardoise/15">
        <div className="space-y-5 lg:pr-10">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ardoise">Inscriptions</h3>
          {enrollments.length ? enrollments.map((item) => (
            <article key={item.id} className={`relative rounded-lg border border-ardoise/12 bg-white p-4 shadow-sm lg:after:absolute lg:after:right-[-2.9rem] lg:after:top-7 lg:after:h-3 lg:after:w-3 lg:after:rounded-full lg:after:border-4 lg:after:border-brume ${isFormationTerminee(item.statut, item.training_session.formation_id, certifications) ? 'lg:after:bg-sauge' : 'lg:after:bg-ardoise'}`}>
              <span className={`rounded px-2 py-1 font-mono text-[10px] font-semibold uppercase ${isFormationTerminee(item.statut, item.training_session.formation_id, certifications) ? 'bg-sauge/10 text-sauge-700' : 'bg-ardoise/10 text-ardoise-700'}`}>{isFormationTerminee(item.statut, item.training_session.formation_id, certifications) ? 'Terminée' : item.statut}</span>
              <h4 className="mt-3 font-heading text-base font-semibold text-encre">{item.training_session.formation?.titre ?? 'Formation inscrite'}</h4>
              {item.training_session.formation?.modalite !== 'presentiel' && !isFormationTerminee(item.statut, item.training_session.formation_id, certifications) && <button type="button" onClick={() => router.push(`/formations/${item.training_session.formation_id}`)} className="mt-3 font-body text-xs font-semibold text-sauge-700 hover:underline">Préparez votre session →</button>}
              <p className="mt-2 font-body text-xs text-ardoise">Session du {new Date(item.training_session.date_debut).toLocaleDateString('fr-FR')}{item.training_session.lieu ? ` · ${item.training_session.lieu}` : ''}</p>
            </article>
          )) : <p className="rounded-lg border border-dashed border-ardoise/25 bg-white/60 p-5 font-body text-sm text-ardoise">Aucune inscription pour le moment.</p>}
        </div>

        <div className="space-y-5 lg:pl-10">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ardoise">Certificats obtenus</h3>
          {certifications.length ? certifications.map((item) => (
            <article key={item.id} className="relative rounded-lg border border-sauge/25 bg-white p-4 shadow-sm lg:after:absolute lg:after:left-[-2.9rem] lg:after:top-7 lg:after:h-3 lg:after:w-3 lg:after:rounded-full lg:after:border-4 lg:after:border-brume lg:after:bg-sauge">
              <span className="rounded bg-sauge/10 px-2 py-1 font-mono text-[10px] font-semibold uppercase text-sauge-700">Certifié</span>
              <h4 className="mt-3 font-heading text-base font-semibold text-encre">✓ {item.nom_certification}</h4>
              <p className="mt-2 font-body text-xs text-ardoise">Obtenu le {new Date(item.date_obtention).toLocaleDateString('fr-FR')}</p>
              <p className="mt-3 font-body text-xs font-semibold text-sauge-700">Certificat disponible dans vos notifications</p>
            </article>
          )) : <p className="rounded-lg border border-dashed border-ardoise/25 bg-white/60 p-5 font-body text-sm text-ardoise">Vos certificats apparaîtront après validation d&apos;un quiz.</p>}
        </div>
      </div>
      <button onClick={onClose} className="mt-9 font-body text-sm font-semibold text-sauge-700 hover:underline">← Retour au catalogue</button>
    </section>
  );
}
