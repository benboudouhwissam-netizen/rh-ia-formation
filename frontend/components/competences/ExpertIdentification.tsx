'use client';

import { useEffect, useState } from 'react';
import { competenceMapApi, CompetenceExpert } from '../../lib/api';
import { employeePresentation, isCuratedEmployee } from '../../lib/employee-presentation';

import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import AISignature from '../ui/AISignature';
import Button from '../ui/Button';

const AVATAR_STYLES = [
    'bg-sauge-100 text-sauge-700',
    'bg-ocre-100 text-ocre-700',
    'bg-sauge-200 text-sauge-800',
    'bg-ardoise-200 text-ardoise-700',
];

export function ExpertIdentification() {
    const [experts, setExperts] = useState<CompetenceExpert[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        let cancelled = false;
        competenceMapApi
            .getTopExperts(20)
            .then((data) => {
                if (!cancelled) setExperts(data);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <Card className="flex items-center gap-3 p-4">
                <Spinner size="sm" color="sauge" />
                <p className="font-body text-body text-ardoise">Identification des experts en cours…</p>
            </Card>
        );
    }

    if (experts.length === 0) {
        return (
            <Card className="p-4">
                <p className="font-body text-body text-ardoise">Aucun expert identifié pour le moment.</p>
            </Card>
        );
    }

    const expertRows = Array.from(
        new Map(
            experts
                .flatMap((groupe) => groupe.experts.map((expert) => ({ ...expert, competence: groupe.competence_nom })))
                .filter((expert) => isCuratedEmployee(expert.utilisateur_id))
                .map((expert) => [expert.utilisateur_id, expert]),
        ).values(),
    );

    const displayedExperts = showAll ? expertRows : expertRows.slice(0, 4);

    return (
        <section>
            <h2 className="mb-4 font-heading text-h3 text-encre">Experts internes</h2>

            <Card variant="ai" className="p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                    <AISignature />
                    <span className="rounded-full bg-ocre/10 px-2 py-1 font-mono text-caption text-ocre-700">
                        Experts identifiés
                    </span>
                </div>
                <p className="font-body text-caption leading-6 text-ardoise">
                    Recommandations générées par l&apos;IA selon les niveaux d&apos;expertise et les
                    disponibilités récentes.
                </p>
                <ol className="mt-2 flex flex-col gap-2">
                    {displayedExperts.map((expert, index) => {
                        const profile = employeePresentation(expert.utilisateur_id);
                        return (
                            <li
                                key={`${expert.utilisateur_id}-${expert.competence}`}
                                className="flex items-center gap-3 rounded-lg border border-ardoise/12 bg-white p-3"
                            >
                                <span
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-caption font-semibold ${AVATAR_STYLES[index % AVATAR_STYLES.length]}`}
                                >
                                    {profile.initials}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-body text-caption font-semibold text-encre">{profile.name}</p>
                                    <p className="truncate font-body text-caption text-ardoise">{profile.role}</p>
                                </div>
                                <span className="rounded bg-ardoise-100 px-2 py-1 font-mono text-caption text-encre">
                                    {expert.competence}
                                </span>
                            </li>
                        );
                    })}
                </ol>
                {expertRows.length > 4 && (
                    <div className="mt-4">
                        <Button
                            variant="tertiary"
                            onClick={() => setShowAll((visible) => !visible)}
                            ariaLabel={showAll ? 'Réduire la liste des experts' : 'Voir tous les experts'}
                            aria-expanded={showAll}
                        >
                            {showAll ? 'Réduire la liste ↑' : 'Voir tous les experts →'}
                        </Button>
                    </div>
                )}
            </Card>
        </section>
    );
}