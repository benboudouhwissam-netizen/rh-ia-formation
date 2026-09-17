'use client';
/* Avatar URLs are user-provided and require a plain img fallback. */
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { Lot3Editor } from '../lot3/Lot3Editor';
import { NotificationCenter } from './NotificationCenter';
import { Chatbot } from './Chatbot';

type Section = 'formations' | 'competences' | 'support';

export function AppShell({ children, active, onSearch }: { children: ReactNode; active: Section; onSearch?: (query: string) => void }) {
  const pathname = usePathname();
  const { employee, logout } = useAuth();
  const initials = employee?.nom_complet.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() ?? 'RH';
  return <div className="min-h-screen bg-brume text-encre">
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-32.5 flex-col border-r border-ardoise/12 bg-white px-3 py-4 md:flex">
      <Link href={employee ? '/profil' : '/'} className="mb-8 flex min-w-0 items-center gap-3 px-1"><span className="flex h-8 w-8 shrink-0 aspect-square items-center justify-center overflow-hidden rounded-xl bg-sauge font-bold text-white">{employee?.avatar_url ? <img src={employee.avatar_url} alt="" className="h-full w-full object-cover" /> : initials}</span><span className="min-w-0 flex-1"><span className="block truncate font-semibold">{employee?.nom_complet ?? 'HR Manager'}</span><span className="block truncate text-xs text-ardoise">{employee ? 'Espace employé' : 'Institutional Portal'}</span></span></Link>
      <nav className="flex flex-1 flex-col gap-1"><Link href="/" className={`rounded-lg px-3 py-2.5 text-sm ${active === 'formations' ? 'bg-sauge/15 font-semibold text-sauge-700' : 'text-ardoise'}`}><i className="fa-solid fa-graduation-cap mr-2 text-current" />Formations</Link><Link href="/competences" className={`rounded-lg px-3 py-2.5 text-sm ${active === 'competences' ? 'bg-sauge/15 font-semibold text-sauge-700' : 'text-ardoise'}`}><i className="fa-solid fa-medal mr-2 text-current" />Compétences</Link></nav>
      {employee ? <button type="button" onClick={() => void logout()} className="mt-auto rounded-lg px-3 py-2.5 text-left text-sm text-ardoise">Se déconnecter</button> : <Link href="/connexion" className="mt-auto rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-sauge-700 hover:bg-sauge/10">Se connecter</Link>}
    </aside>
    <div className="min-h-screen md:pl-32.5"><header className="flex h-18 items-center border-b border-ardoise/12 bg-white px-4 md:px-7"><h1 className="hidden text-xl font-semibold lg:block">Plateforme RH</h1><div className="ml-auto flex items-center gap-3"><input className="hidden w-56 rounded-full border border-ardoise/15 bg-brume px-3 py-2 text-xs md:block" placeholder="Rechercher une formation…" onChange={(event) => onSearch?.(event.target.value)} /><NotificationCenter /><Link href="/support" aria-label="Ouvrir le centre d'aide" className="p-2 text-ardoise"><i className="fa-regular fa-circle-question text-base" /></Link></div></header><main className="mx-auto w-full max-w-180 px-4 py-6 md:px-8 md:py-8">{children}{pathname === '/profil' && <Lot3Editor />}</main></div>
    <Chatbot />
  </div>;
}
