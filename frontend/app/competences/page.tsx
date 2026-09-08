import { Matrix } from '../../components/competences/Matrix';
import { ExpertIdentification } from '../../components/competences/ExpertIdentification';
import { CompetencyGapAnalysis } from '../../components/competences/CompetencyGapAnalysis';
import { AppShell } from '../../components/ui/AppShell';

export default function CompetencesPage() {
    return (
        <AppShell active="competences">
            <div className="flex flex-col gap-10">
                <header className="max-w-3xl">
                    <h1 className="font-heading text-h1 text-encre">Cartographie des compétences</h1>
                    <p className="mt-2 font-body text-lg text-ardoise">Analysez les forces et identifiez les besoins en formation de vos équipes.</p>
                </header>
                <Matrix />
                <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)] 2xl:items-start">
                    <ExpertIdentification />
                    <CompetencyGapAnalysis />
                </div>
            </div>
        </AppShell>
    );
}
