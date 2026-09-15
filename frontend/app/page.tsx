'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormationCatalog } from '../components/formations/FormationCatalog';
import { FormationDetail } from '../components/formations/FormationDetail';
import { RecommendedTrainings } from '../components/formations/RecommendedTrainings';
import { AppShell } from '../components/ui/AppShell';
import { useAuth } from '../components/auth/AuthProvider';
import { MyFormations } from '../components/formations/MyFormations';

export default function Home() {
  const [formationSelectionnee, setFormationSelectionnee] = useState<string | null>(null);
  const [showMyFormations, setShowMyFormations] = useState(false);
  const [catalogueSearch, setCatalogueSearch] = useState('');
  const { employee, ready } = useAuth();
  const router = useRouter();

  if (!ready) return <main className="grid min-h-screen place-items-center bg-brume font-body text-ardoise">Chargement de votre espace…</main>;
  if (!employee) return (
    <AppShell active="formations" onSearch={setCatalogueSearch}>
      <div className="flex flex-col gap-6">
        <header className="max-w-3xl"><p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ardoise">RH IA&nbsp;&nbsp;›&nbsp;&nbsp; Catalogue de formation</p><h1 className="font-heading text-h1 text-encre">Catalogue de formation</h1><p className="mt-2 font-body text-lg text-ardoise">Découvrez les parcours disponibles. Connectez-vous pour vous inscrire à une session.</p></header>
        <FormationCatalog onSelect={() => router.push('/connexion')} searchQuery={catalogueSearch} />
      </div>
    </AppShell>
  );

  return (
    <AppShell
      active="formations"
      onSearch={(query) => {
        setCatalogueSearch(query);
        setFormationSelectionnee(null);
        setShowMyFormations(false);
      }}
    >
      <div className="flex flex-col gap-6">
        <header className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ardoise">RH IA&nbsp;&nbsp;›&nbsp;&nbsp; Catalogue de formation</p>
            <h1 className="font-heading text-h1 text-encre">Catalogue de formation</h1>
            <p className="mt-2 font-body text-lg text-ardoise">Développez vos compétences avec des parcours adaptés à votre métier et à vos objectifs.</p>
          </div>
          <button onClick={() => setShowMyFormations(true)} className="rounded-md bg-sauge px-5 py-3 font-body text-sm font-semibold text-white shadow-sm transition hover:bg-sauge-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sauge focus-visible:ring-offset-2">Mes formations</button>
        </header>

        <RecommendedTrainings utilisateurId={employee.id} posteId={employee.poste_id} onSelect={setFormationSelectionnee} />

        {showMyFormations ? <MyFormations onClose={() => setShowMyFormations(false)} /> : formationSelectionnee ? (
        <div>
          <button
            onClick={() => setFormationSelectionnee(null)}
            className="font-body text-sm text-sauge mb-4 underline"
          >
            ← Retour au catalogue
          </button>
          <FormationDetail formationId={formationSelectionnee} utilisateurId={employee.id} />
        </div>
        ) : (
          <FormationCatalog onSelect={setFormationSelectionnee} searchQuery={catalogueSearch} />
        )}
      </div>
    </AppShell>
  );
}
