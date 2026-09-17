'use client';

/* The catalogue uses remote decorative images with an onError fallback. */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from 'react';
import { formationsApi, Formation, FormationFilters } from '../../lib/api';

const NIVEAUX = ['Débutant', 'Intermédiaire', 'Avancé'];

function FormationIllustration({ category, niveau, title }: { category?: string | null; niveau?: string | null; title: string }) {
  const key = `${category ?? ''} ${title}`.toLowerCase();
  const imageUrl = key.includes('devops') || key.includes('kubernetes') || key.includes('docker')
    ? 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80'
    : key.includes('rh') || key.includes('management') || key.includes('leadership')
      ? 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80'
      : key.includes('droit') || key.includes('rgpd') || key.includes('conform')
        ? 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80'
        : key.includes('react') || key.includes('frontend')
          ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80'
          : 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80';
  const palette = key.includes('devops') || key.includes('kubernetes') || key.includes('docker')
    ? ['#243D3B', '#87C1B7']
    : key.includes('rh') || key.includes('management') || key.includes('leadership')
      ? ['#284744', '#B4DBD3']
      : key.includes('droit') || key.includes('rgpd') || key.includes('conform')
        ? ['#6C4327', '#E6D6A2']
        : ['#1C2B39', '#B4DBD3'];

  return (
    <div className="relative -mx-3 -mt-3 mb-3 h-32 overflow-hidden rounded-t-lg" style={{ backgroundColor: palette[0] }} aria-label={`Illustration de la formation ${title}`}>
      <img
        src={imageUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-90"
        onError={(event) => { event.currentTarget.style.display = 'none'; }}
      />
      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2 py-1 font-mono text-[9px] font-semibold text-sauge-800 shadow-sm">
        {niveau ?? 'FORMATION'}
      </span>
      <svg viewBox="0 0 320 112" className="h-full w-full" role="img" aria-hidden="true">
        <circle cx="266" cy="-4" r="76" fill={palette[1]} opacity="0.85" />
        <circle cx="292" cy="86" r="46" fill="#FFFFFF" opacity="0.12" />
        <path d="M28 76 58 46l30 30-30 30z" fill="#FFFFFF" opacity="0.16" />
        <path d="M120 76 150 46l30 30-30 30z" fill="#FFFFFF" opacity="0.12" />
        <path d="M48 56h136" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
        <path d="M80 35 58 56l22 21M151 35l22 21-22 21" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function FormationCatalog({ onSelect, searchQuery = '' }: { onSelect: (formationId: string) => void; searchQuery?: string }) {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [categoriesDisponibles, setCategoriesDisponibles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [categorie, setCategorie] = useState('');
  const [niveau, setNiveau] = useState('');
  const [modalite, setModalite] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    setSearch(searchQuery);
    setPage(1);
  }, [searchQuery]);

  const filters: FormationFilters = useMemo(
    () => ({ categorie: categorie || undefined, niveau: niveau || undefined, modalite: modalite || undefined, limit: 50, offset: 0 }),
    [categorie, niveau, modalite],
  );

  // Récupère la liste complète (non filtrée) une seule fois, pour construire
  // dynamiquement les options du filtre "catégorie" à partir des données réelles.
  useEffect(() => {
    formationsApi
      .list({ limit: 200 })
      .then((data) => {
        const uniques = Array.from(new Set(data.map((f) => f.categorie).filter(Boolean))) as string[];
        setCategoriesDisponibles(uniques.sort());
      })
      .catch(() => {
        /* silencieux : le filtre reste simplement vide en cas d'échec */
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    formationsApi
      .list(filters)
      .then((data) => {
        if (!cancelled) setFormations(data);
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de charger le catalogue. Réessayez.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const formationsFiltrees = formations.filter((f) =>
    search.trim() === '' ? true : f.titre.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(formationsFiltrees.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleFormations = formationsFiltrees.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <section>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="font-heading text-h3 text-encre">Toutes les formations</h2>
        {!loading && <span className="font-mono text-xs text-ardoise">{formationsFiltrees.length} résultat{formationsFiltrees.length > 1 ? 's' : ''}</span>}
      </div>

      {/* Barre de filtres */}
      <div className="mb-5 grid gap-2 rounded-xl border border-ardoise/12 bg-white p-3 lg:grid-cols-[minmax(220px,1fr)_190px_155px_190px]" role="search">
        <label className="sr-only" htmlFor="recherche-formation">
          Rechercher une formation
        </label>
        <input
          id="recherche-formation"
          type="text"
          placeholder="Rechercher une formation…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="font-body min-w-0 rounded-lg border border-ardoise/20 bg-brume px-3 py-2.5 text-sm text-encre outline-none focus-visible:ring-2 focus-visible:ring-sauge"
        />

        <select
          value={categorie}
          onChange={(e) => { setCategorie(e.target.value); setPage(1); }}
          aria-label="Filtrer par catégorie"
          className="font-body rounded-lg border border-ardoise/12 bg-white px-3 py-2.5 text-sm text-encre focus-visible:ring-2 focus-visible:ring-sauge"
        >
          <option value="">Toutes catégories</option>
          {categoriesDisponibles.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={niveau}
          onChange={(e) => { setNiveau(e.target.value); setPage(1); }}
          aria-label="Filtrer par niveau"
          className="font-body rounded-lg border border-ardoise/12 bg-white px-3 py-2.5 text-sm text-encre focus-visible:ring-2 focus-visible:ring-sauge"
        >
          <option value="">Tous niveaux</option>
          {NIVEAUX.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <select
          value={modalite}
          onChange={(e) => { setModalite(e.target.value); setPage(1); }}
          aria-label="Filtrer par modalité"
          className="font-body rounded-lg border border-ardoise/12 bg-white px-3 py-2.5 text-sm text-encre focus-visible:ring-2 focus-visible:ring-sauge"
        >
          <option value="">Toutes les modalités</option>
          <option value="presentiel">Présentiel</option>
          <option value="e_learning">E-learning</option>
        </select>
      </div>

      {/* États de chargement / erreur */}
      {loading && (
        <p className="font-body text-ardoise" role="status">
          Chargement du catalogue…
        </p>
      )}
      {error && (
        <p className="font-body text-alerte" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && formationsFiltrees.length === 0 && (
        <p className="font-body text-ardoise">Aucune formation ne correspond à votre recherche.</p>
      )}

      {/* Grille de formations */}
      <div className="grid grid-cols-12 gap-5">
        {visibleFormations.map((formation) => (
          <button
            key={formation.id}
            onClick={() => onSelect(formation.id)}
            className="col-span-12 flex min-h-[320px] flex-col overflow-hidden rounded-lg border border-ardoise/12 bg-white p-3 text-left shadow-[0_1px_1px_rgba(21,43,55,0.03)] transition hover:-translate-y-0.5 hover:border-sauge hover:shadow-md focus-visible:ring-2 focus-visible:ring-sauge [&_span[aria-hidden='true']]:!h-6 [&_span[aria-hidden='true']]:!w-6 [&_span[aria-hidden='true']:hover]:!bg-sauge [&_span[aria-hidden='true']:hover]:!text-white sm:col-span-6 lg:col-span-4"
          >
            <FormationIllustration category={formation.categorie} niveau={formation.niveau} title={formation.titre} />
            <div className="mb-1 min-w-0"><h2 className="break-normal font-heading text-base font-semibold text-encre">{formation.titre}</h2></div>
            <p className="mb-3 line-clamp-2 font-body text-xs text-ardoise">{formation.description}</p>
            <div className="mt-auto border-t border-ardoise/12 pt-2.5 group-hover:border-white/30"><div className="mb-2 flex items-center justify-between"><span className="font-mono text-[9px] uppercase tracking-[0.12em] text-ardoise group-hover:text-white/80">{formation.categorie ?? 'Général'}</span><span className="rounded bg-sauge/10 px-2 py-1 font-mono text-[8px] font-semibold uppercase text-sauge-700 group-hover:bg-white/90 group-hover:text-sauge-700">{formation.modalite === 'presentiel' ? 'Présentiel' : 'E-learning'}</span></div><div className="flex items-end justify-between"><div className="flex gap-5 font-mono text-[10px] text-ardoise group-hover:text-white/80"><span><b className="block text-[8px] font-normal uppercase text-ardoise/70 group-hover:text-white/70">Durée</b>{formation.duree ? `${Math.floor(formation.duree / 60).toString().padStart(2, '0')}:${(formation.duree % 60).toString().padStart(2, '0')} h` : '—'}</span><span><b className="block text-[8px] font-normal uppercase text-ardoise/70 group-hover:text-white/70">Niveau</b>{formation.niveau ?? '—'}</span></div><span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-md border border-sauge/30 text-base text-sauge transition group-hover:border-white/70 group-hover:text-white">→</span></div></div>
            <div className="hidden">
              <span className="rounded-full bg-brume px-2 py-1 font-body text-[11px] font-medium text-ardoise">{formation.categorie ?? 'Général'}</span>
              <span>{formation.duree ? `${formation.duree} min` : ''}</span>
            </div>
          </button>
        ))}
      </div>
      {!loading && !error && totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination des formations">
          <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} className="grid h-7 w-7 place-items-center rounded border border-ardoise/15 bg-white font-body text-xs text-ardoise disabled:opacity-40" aria-label="Page précédente">‹</button>
          {pageNumbers.map((number) => <button key={number} type="button" onClick={() => setPage(number)} aria-current={number === currentPage ? 'page' : undefined} className={`grid h-7 min-w-7 place-items-center rounded border font-mono text-[10px] ${number === currentPage ? 'border-sauge bg-sauge text-white' : 'border-ardoise/15 bg-white text-encre hover:bg-brume'}`}>{number}</button>)}
          <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages} className="grid h-7 w-7 place-items-center rounded border border-ardoise/15 bg-white font-body text-xs text-ardoise disabled:opacity-40" aria-label="Page suivante">›</button>
        </nav>
      )}
    </section>
  );
}
