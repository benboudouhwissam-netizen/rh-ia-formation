'use client';

import { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { competenceMapApi, EcartParPoste } from '../../lib/api';

import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import Select from '../ui/formulaire/Select';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Couleurs du Design System — Sauge (observé) / Ocre (requis, car c'est
// l'IA qui calcule l'écart et la cible à atteindre)
const COULEUR_OBSERVE = '#3E7C74';
const COULEUR_REQUIS = '#C89B3C';

const POSTE_LABELS: Record<string, string> = {
    'aaaaaaaa': 'Développeur frontend',
    'bbbbbbbb': 'Ingénieur logiciel senior',
    'cccccccc': 'Architecte cloud',
    'dddddddd': 'Chef de projet formation',
    'eeeeeeee': 'Responsable RH',
    'ffffffff': 'DevOps',
};

function posteLabel(id: string) {
    return POSTE_LABELS[id.slice(0, 8).toLowerCase()] ?? 'Poste à définir';
}

export function CompetencyGapAnalysis() {
    const [postes, setPostes] = useState<string[]>([]);
    const [posteId, setPosteId] = useState<string>('');
    const [ecarts, setEcarts] = useState<EcartParPoste | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        competenceMapApi.listPostes().then((liste) => {
            setPostes(liste);
            if (liste.length > 0) setPosteId(liste[0]);
        });
    }, []);

    useEffect(() => {
        if (!posteId) return;
        let cancelled = false;
        setLoading(true);
        const load = () => competenceMapApi.getEcartsParPoste(posteId).then((data) => {
            if (!cancelled) setEcarts(data);
        }).finally(() => {
            if (!cancelled) setLoading(false);
        });
        load();
        const timer = window.setInterval(load, 15000);
        return () => {
            cancelled = true;
            window.clearInterval(timer);
        };
    }, [posteId]);

    const chartData = {
        labels: ecarts?.competences.map((c) => c.competence_nom) ?? [],
        datasets: [
            {
                label: 'Niveau observé (moyenne)',
                data: ecarts?.competences.map((c) => c.niveau_moyen_observe) ?? [],
                backgroundColor: COULEUR_OBSERVE,
                borderRadius: 4,
            },
            {
                label: 'Niveau requis',
                data: ecarts?.competences.map((c) => c.niveau_requis) ?? [],
                backgroundColor: COULEUR_REQUIS,
                borderRadius: 4,
            },
        ],
    };

    return (
        <section>
            <h2 className="mb-4 font-heading text-h3 text-encre">Écarts de compétences par poste</h2>

            <div className="mb-4 max-w-xs">
                <Select
                    label="Choisir un poste"
                    value={posteId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPosteId(e.target.value)}
                    options={postes.map((p) => ({ value: p, label: posteLabel(p) }))}
                />
            </div>

            {loading && (
                <Card className="flex items-center gap-3 p-4">
                    <Spinner size="sm" color="sauge" />
                    <p className="font-body text-body text-ardoise">Calcul des écarts…</p>
                </Card>
            )}

            {!loading && ecarts && ecarts.competences.length > 0 && (
                <Card className="p-4">
                    <Bar
                        data={chartData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: { position: 'top', labels: { font: { family: 'IBM Plex Sans' } } },
                            },
                            scales: {
                                y: { beginAtZero: true, max: 5, ticks: { stepSize: 1 } },
                            },
                        }}
                    />
                </Card>
            )}

            {!loading && ecarts && ecarts.competences.length === 0 && (
                <Card className="p-4">
                    <p className="font-body text-body text-ardoise">
                        Aucune compétence requise définie pour ce poste.
                    </p>
                </Card>
            )}
        </section>
    );
}
