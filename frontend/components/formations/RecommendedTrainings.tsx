'use client';

import { useEffect, useState } from 'react';
import { recommendationsApi, RecommandationFormation } from '../../lib/api';
import AISignature from '../ui/AISignature';

interface RecommendedTrainingsProps {
  utilisateurId: string;
  posteId: string;
  onSelect?: (formationId: string) => void;
}

function RecommendationIcon({ index }: { index: number }) {
  const icons = [
    <path key="trend" d="m5 15 5-5 3 3 6-7M15 6h4v4" strokeLinecap="round" strokeLinejoin="round" />,
    <><rect key="box" x="5" y="5" width="14" height="14" rx="2" /><path key="blocks" d="M9 9h6M9 12h6M9 15h3" strokeLinecap="round" /></>,
    <><circle key="circle" cx="12" cy="12" r="6" /><path key="rays" d="M12 2v2M12 20v2M2 12h2M20 12h2" strokeLinecap="round" /></>,
  ];
  return <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">{icons[index] ?? icons[0]}</svg>;
}

export function RecommendedTrainings({ utilisateurId, posteId, onSelect }: RecommendedTrainingsProps) {
  const [recommandations, setRecommandations] = useState<RecommandationFormation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    recommendationsApi
      .getForUser(utilisateurId, posteId)
      .then((data) => {
        if (!cancelled) setRecommandations(data.recommandations ?? []);
      })
      .catch(() => {
        if (!cancelled) setError('Impossible de charger vos recommandations pour le moment.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [utilisateurId, posteId]);

  if (loading) {
    return (
      <p className="font-body text-ardoise" role="status">
        Analyse de vos écarts de compétences…
      </p>
    );
  }

  if (error) {
    return (
      <p className="font-body text-alerte" role="alert">
        {error}
      </p>
    );
  }

  if (recommandations.length === 0) {
    return (
      <p className="font-body text-ardoise">
        Aucun écart de compétence détecté pour le moment — rien à recommander.
      </p>
    );
  }

  return (
    <section className="border-l-2 border-dashed border-ocre bg-ocre/5 px-3 py-3 md:px-4">
      <div className="mb-2">
        <div>
          <AISignature />
          <h2 className="mt-1 font-heading text-lg font-bold text-encre">Recommandé pour vous</h2>
          <p className="mt-1 max-w-3xl font-body text-xs text-ardoise">Ces formations ciblent les écarts détectés dans votre profil et votre poste actuel.</p>
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {recommandations.slice(0, 3).map((rec, index) => (
            <li key={rec.formation_id}>
              <button
                onClick={() => onSelect?.(rec.formation_id)}
                className="flex h-full w-full flex-col justify-between rounded-lg border border-ocre/20 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-sauge hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sauge"
              >
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-md bg-ocre/10 text-ocre-700"><RecommendationIcon index={index} /></span>
                    <span className="rounded-full bg-ocre/10 px-2 py-1 font-mono text-[9px] font-semibold text-ocre-700">MATCH {Math.round(rec.score_pertinence * 100)}%</span>
                  </div>
                  <h3 className="font-heading text-sm font-semibold text-encre">{rec.titre}</h3>
                  <p className="mt-1 line-clamp-2 font-body text-xs leading-4 text-ardoise">{rec.motif}</p>
                </div>
                <span className="mt-2 font-body text-xs font-semibold text-sauge-700">Voir la formation →</span>
              </button>
            </li>
          ))}
      </ul>
    </section>
  );
}
