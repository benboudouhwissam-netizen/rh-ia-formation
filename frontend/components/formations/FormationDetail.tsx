'use client';

import { useEffect, useState, type FormEvent } from 'react';
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
  const [sessionDate, setSessionDate] = useState('');
  const [sessionLieu, setSessionLieu] = useState('');
  const [sessionCapacite, setSessionCapacite] = useState('');
  const [sessionCreationStatut, setSessionCreationStatut] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { employee } = useAuth();
  const router = useRouter();
  const selectedSession = sessions.find((session) => session.id === selectedSessionId);

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
        const upcomingSessions = (data.data ?? []).filter((session) => new Date(session.date_debut).getTime() >= Date.now());
        if (!cancelled) setSessions(upcomingSessions);
        if (!cancelled) setSelectedSessionId(upcomingSessions[0]?.id ?? null);
        if (!cancelled && upcomingSessions[0]?.id) {
          enrollmentsApi.listForSession(upcomingSessions[0].id, utilisateurId)
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
  }, [formationId, utilisateurId]);

  async function handleCreateSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sessionDate) return;
    setSessionCreationStatut('loading');
    try {
      const created = await trainingSessionsApi.create({
        formation_id: formationId,
        date_debut: new Date(`${sessionDate}T09:00:00`).toISOString(),
        ...(formation?.modalite === 'presentiel' ? {
          lieu: sessionLieu || undefined,
          capacite: sessionCapacite ? Number(sessionCapacite) : undefined,
        } : {}),
        statut: 'planifiee',
      });
      const refreshed = await trainingSessionsApi.listByFormation(formationId);
      setSessions((refreshed.data ?? []).filter((session) => new Date(session.date_debut).getTime() >= Date.now()));
      setSelectedSessionId(created.id);
      setSessionDate('');
      setSessionLieu('');
      setSessionCapacite('');
      setSessionCreationStatut('success');
    } catch {
      setSessionCreationStatut('error');
    }
  }

  async function handleInscription() {
    if (!selectedSessionId || !employee) return;
    setInscriptionStatut('loading');
    try {
      await formationsApi.inscrire(selectedSessionId, utilisateurId, { nomComplet: employee.nom_complet, emailProfessionnel: employee.email_professionnel });
      const refreshed = await trainingSessionsApi.listByFormation(formationId);
      setSessions((refreshed.data ?? []).filter((session) => new Date(session.date_debut).getTime() >= Date.now()));
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
          <p className="font-mono text-xs text-ardoise mb-1">Modalité</p>
          <p className="font-body text-encre">{formation.modalite === 'presentiel' ? 'Présentiel' : 'E-learning'}</p>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="font-heading text-sm uppercase tracking-wide text-ardoise mb-2">
          Sessions programmées
        </h2>
        {formation.modalite !== 'presentiel' && <form onSubmit={handleCreateSession} className="mb-4 rounded-lg border border-ardoise/12 bg-white p-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex min-w-[220px] flex-1 flex-col gap-1 font-body text-sm text-encre">
              <span className="font-semibold">Choisir la date d&apos;une session</span>
              <input
                type="date"
                value={sessionDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(event) => setSessionDate(event.target.value)}
                required
                className="rounded-lg border border-ardoise/25 px-3 py-2 outline-none focus:border-sauge focus:ring-2 focus:ring-sauge/20"
              />
            </label>
            {formation.modalite === 'presentiel' && <label className="flex min-w-[180px] flex-1 flex-col gap-1 font-body text-sm text-encre">
              <span className="font-semibold">Salle</span>
              <input value={sessionLieu} onChange={(event) => setSessionLieu(event.target.value)} placeholder="Salle Atlas" className="rounded-lg border border-ardoise/25 px-3 py-2 outline-none focus:border-sauge focus:ring-2 focus:ring-sauge/20" />
            </label>}
            {formation.modalite === 'presentiel' && <label className="flex w-36 flex-col gap-1 font-body text-sm text-encre">
              <span className="font-semibold">Places</span>
              <input type="number" min="1" value={sessionCapacite} onChange={(event) => setSessionCapacite(event.target.value)} placeholder="20" className="rounded-lg border border-ardoise/25 px-3 py-2 outline-none focus:border-sauge focus:ring-2 focus:ring-sauge/20" />
            </label>}
            <button
              type="submit"
              disabled={!sessionDate || sessionCreationStatut === 'loading'}
              className="rounded-lg bg-sauge px-5 py-2.5 font-body font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {sessionCreationStatut === 'loading' ? 'Enregistrement…' : 'Programmer la session'}
            </button>
          </div>
          {sessionCreationStatut === 'success' && (
            <p className="mt-2 font-body text-sm text-sauge" role="status">Session programmée à la date choisie.</p>
          )}
          {sessionCreationStatut === 'error' && (
            <p className="mt-2 font-body text-sm text-alerte" role="alert">Impossible de programmer cette session. Réessayez.</p>
          )}
        </form>}
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
                  <p className="mt-1 font-body text-xs text-ardoise">{formation.modalite === 'presentiel' ? `${session.lieu ?? 'Salle à confirmer'} · ${session.places_restantes == null ? 'Places non limitées' : `${session.places_restantes} place${session.places_restantes > 1 ? 's' : ''} restante${session.places_restantes > 1 ? 's' : ''}`}` : 'Accès en ligne · Formation e-learning'}</p>
                  </div>
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button
        onClick={handleInscription}
        disabled={!selectedSessionId || selectedSession?.places_restantes === 0 || !employee || alreadyEnrolled || inscriptionStatut === 'loading' || inscriptionStatut === 'success'}
        className="font-body rounded-lg bg-sauge px-6 py-3 text-white font-semibold transition hover:opacity-90 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-encre"
      >
        {alreadyEnrolled || inscriptionStatut === 'success' ? 'Déjà inscrit à cette session' : "S'inscrire à la session sélectionnée"}
      </button>

      {formation.modalite !== 'presentiel' && <button
        type="button"
        onClick={() => router.push(`/formations/${formationId}`)}
        disabled={!alreadyEnrolled && inscriptionStatut !== 'success'}
        className="mt-4 block rounded-lg border border-sauge px-6 py-3 font-body font-semibold text-sauge transition hover:bg-sauge/10 focus-visible:ring-2 focus-visible:ring-sauge disabled:cursor-not-allowed disabled:border-ardoise/25 disabled:text-ardoise/60"
      >
        {alreadyEnrolled || inscriptionStatut === 'success' ? 'Commencer le parcours e-learning' : 'Inscrivez-vous pour accéder au e-learning'}
      </button>}

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
