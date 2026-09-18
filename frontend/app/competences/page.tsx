'use client';

import { Matrix } from '../../components/competences/Matrix';
import { ExpertIdentification } from '../../components/competences/ExpertIdentification';
import { CompetencyGapAnalysis } from '../../components/competences/CompetencyGapAnalysis';
import { AppShell } from '../../components/ui/AppShell';
import Card from '../../components/ui/Card';
import Link from 'next/link';
import { useAuth } from '../../components/auth/AuthProvider';

export default function CompetencesPage() {
    const { employee } = useAuth();
    return (
        <AppShell active="competences">
            <div className="flex flex-col gap-10">
                <header className="max-w-3xl">
                    <h1 className="font-heading text-h1 text-encre">Cartographie des compétences</h1>
                    <p className="mt-2 font-body text-lg text-ardoise">Analysez les forces et identifiez les besoins en formation de vos équipes.</p>
                </header>
                {employee ? <>
                    <Matrix />
                    <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)] 2xl:items-start">
                        <ExpertIdentification />
                        <CompetencyGapAnalysis />
                    </div>
                </> : <Card className="p-8 text-center">
                    <h2 className="font-heading text-xl font-semibold text-encre">Connectez-vous pour consulter vos compétences</h2>
                    <p className="mx-auto mt-2 max-w-xl font-body text-sm text-ardoise">La matrice, les experts et les écarts de compétences sont réservés aux employés connectés.</p>
                    <Link href="/connexion" className="mt-5 inline-flex rounded-lg bg-sauge px-5 py-2.5 font-body text-sm font-semibold text-white hover:bg-sauge-700">Se connecter</Link>
                </Card>}
            </div>
        </AppShell>
    );
}
