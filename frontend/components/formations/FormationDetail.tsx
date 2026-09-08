'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { enrollmentsApi, formationsApi, trainingSessionsApi, Formation, TrainingSession } from '../../lib/api';
import { useAuth } from '../auth/AuthProvider';

interface FormationDetailProps {
  formationId: string;
  utilisateurId: string;
}

export function FormationDetail({ formationId, utilisateurId }: FormationDetailProps) {
  const [formation, setFormation] = useState<Formation | null>(null);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inscriptionStatut, setInscriptionStatut] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { employee } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    formationsApi
      .getById(formationId)
      .then((data) => {
        if (!cancelled) setFormation(data);
      })
      .catch(() => {
        if (!cancelled) setFormation(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    trainingSessionsApi
      .listByFormation(formationId)
      .then((data) => {
        if (!cancelled) setSessions((data.data ?? []).slice(0, 2));
        if (!cancelled) setSelectedSessionId(data.data[0]?.id ?? null);
        if (!cancelled && data.data[0]?.id) {
          enrollmentsApi.listForSession(data.data[0].id, utilisateurId)
            .then((enrollments) => {
              if (!cancelled) setAlreadyEnrolled(enrollments.data.length > 0);
            })
            .catch(() => undefined);
        }
      })
      .catch(() => {
        if (!cancelled) setSessions([]);
      });

    return () => {
      cancelled = true;
    };
  }, [formationId]);

  async function handleInscription() {
    if (!selectedSessionId || !employee) return;
    setInscriptionStatut('loading');
    try {
      await formationsApi.inscrire(selectedSessionId, utilisateurId, { nomComplet: employee.nom_complet, emailProfessionnel: employee.email_professionnel });
      setInscriptionStatut('success');
      window.dispatchEvent(new Event('rh-notifications-refresh'));
    } catch {
      setInscriptionStatut('error');
    }
  }

  if (loading) {
    return (
      <p className="font-body text-ardoise" role="status">
        Chargement de la formation…
      </p>
    );
  }

  if (!formation) {
    return <p className="font-body text-ardoise">Formation introuvable.</p>;
  }

  return (
    <article className="bg-brume">
      <p className="font-mono text-xs text-ardoise mb-2">{formation.categorie ?? 'Général'}</p>
      <h1 className="font-heading text-3xl font-bold text-encre mb-4">{formation.titre}</h1>

      <section className="mb-6">
        <h2 className="font-heading text-sm uppercase tracking-wide text-ardoise mb-2">Description</h2>
        <p className="font-body text-encre leading-relaxed">{formation.description}</p>
      </section>

      <section className="grid grid-cols-12 gap-1 mb-6">
        <div className="col-span-4 rounded-lg border border-ardoise/12 bg-white p-4">
          <p className="font-mono text-xs text-ardoise mb-1">Niveau</p>
          <p className="font-body text-encre">{formation.niveau ?? '—'}</p>
        </div>
        <div className="col-span-4 rounded-lg border border-ardoise/12 bg-white p-4">
          <p className="font-mono text-xs text-ardoise mb-1">Durée</p>
          <p className="font-body text-encre">{formation.duree ? `${formation.duree} min` : '—'}</p>
        </div>
        <div className="col-span-4 rounded-lg border border-ardoise/12 bg-white p-4">
          <p className="font-mono text-xs text-ardoise mb-1">Statut</p>
          <p className="font-body text-encre">{formation.statut ?? '—'}</p>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="font-heading text-sm uppercase tracking-wide text-ardoise mb-2">
          Sessions programmées
        </h2>
        {sessions.length === 0 ? (
          <p className="font-body text-sm text-ardoise">Aucune session programmée pour le moment.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sessions.map((session) => (
              <li
                key={session.id}
                className={`rounded-lg border bg-white p-4 transition-colors ${
                  selectedSessionId === session.id
                    ? 'border-[#0066FF] bg-[#0066FF]/5'
                    : 'border-ardoise/12 hover:border-ardoise/40'
                }`}
              >
                <label className="flex w-full cursor-pointer items-center justify-between gap-4">
                  <input
                    type="radio"
                    name="session"
                    value={session.id}
                    checked={selectedSessionId === session.id}
                    onChange={() => {
                      setSelectedSessionId(session.id);
                      enrollmentsApi.listForSession(session.id, utilisateurId)
                        .then((enrollments) => setAlreadyEnrolled(enrollments.data.length > 0))
                        .catch(() => setAlreadyEnrolled(false));
                    }}
                    className="h-4 w-4 accent-[#0066FF]"
                  />
                  <div className="flex-1">
                  <p className="font-body text-encre">
                    {new Date(session.date_debut).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  </div>
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button
        onClick={handleInscription}
        disabled={!selectedSessionId || !employee || alreadyEnrolled || inscriptionStatut === 'loading' || inscriptionStatut === 'success'}
        className="font-body rounded-lg bg-sauge px-6 py-3 text-white font-semibold transition hover:opacity-90 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-encre"
      >
        {alreadyEnrolled || inscriptionStatut === 'success' ? 'Déjà inscrit à cette session' : "S'inscrire à la session sélectionnée"}
      </button>

      <button
        type="button"
        onClick={() => router.push(`/formations/${formationId}`)}
        disabled={!alreadyEnrolled && inscriptionStatut !== 'success'}
        className="mt-4 block rounded-lg border border-sauge px-6 py-3 font-body font-semibold text-sauge transition hover:bg-sauge/10 focus-visible:ring-2 focus-visible:ring-sauge disabled:cursor-not-allowed disabled:border-ardoise/25 disabled:text-ardoise/60"
      >
        {alreadyEnrolled || inscriptionStatut === 'success' ? 'Commencer le parcours e-learning' : 'Inscrivez-vous pour accéder au e-learning'}
      </button>

      {alreadyEnrolled && <p className="mt-2 font-body text-sm text-sauge" role="status">Votre inscription à cette session est déjà confirmée.</p>}
      {inscriptionStatut === 'success' && !alreadyEnrolled && <p className="mt-2 font-body text-sm text-sauge" role="status">Inscription confirmée. Cette formation est maintenant disponible dans « Mes formations ».</p>}
      {!selectedSessionId && sessions.length === 0 && <p className="mt-2 font-body text-sm text-ardoise">L&apos;inscription sera disponible dès qu&apos;une session sera programmée.</p>}

      {inscriptionStatut === 'error' && (
        <p className="font-body text-sm text-alerte mt-2" role="alert">
          L'inscription a échoué. Réessayez.
        </p>
      )}
    </article>
  );
}
