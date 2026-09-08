'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

const DEFAULT_POSTE_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

export function EmployeeAccess() {
  const { login, register, employee } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) router.replace('/');
  }, [employee, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null); setLoading(true);
    try {
      if (mode === 'login') {
        await login(String(form.get('email')), String(form.get('password')));
      } else {
        await register({
          nomComplet: String(form.get('name')), email: String(form.get('email')),
          password: String(form.get('password')), posteId: String(form.get('poste')),
        });
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Impossible de continuer.');
    } finally { setLoading(false); }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brume p-4">
      <section className="w-full max-w-md rounded-lg border border-ardoise/12 bg-white p-6 shadow-sm">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-encre font-heading font-bold text-white">RH</span>
        <h1 className="mt-5 font-heading text-h2 text-encre">{mode === 'login' ? 'Accédez à vos formations' : 'Créez votre espace salarié'}</h1>
        <p className="mt-2 font-body text-sm text-ardoise">Choisissez vos formations, inscrivez-vous à une session et obtenez vos certificats.</p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          {mode === 'register' && <label className="block font-body text-sm font-medium text-encre">Nom complet<input required name="name" className="mt-1 w-full rounded-lg border border-ardoise/20 px-3 py-2" /></label>}
          <label className="block font-body text-sm font-medium text-encre">E-mail professionnel<input required name="email" type="email" className="mt-1 w-full rounded-lg border border-ardoise/20 px-3 py-2" /></label>
          <label className="block font-body text-sm font-medium text-encre">Mot de passe<input required name="password" type="password" minLength={8} className="mt-1 w-full rounded-lg border border-ardoise/20 px-3 py-2" /></label>
          {mode === 'register' && <label className="block font-body text-sm font-medium text-encre">Poste<select name="poste" defaultValue={DEFAULT_POSTE_ID} className="mt-1 w-full rounded-lg border border-ardoise/20 bg-white px-3 py-2"><option value={DEFAULT_POSTE_ID}>Chef de projet formation</option><option value="eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee">Développeur backend</option><option value="ffffffff-ffff-ffff-ffff-ffffffffffff">DevOps</option></select></label>}
          {error && <p role="alert" className="rounded-lg bg-alerte-50 p-3 font-body text-sm text-alerte">{error}</p>}
          <button disabled={loading} className="w-full rounded-lg bg-sauge px-4 py-3 font-body font-semibold text-white disabled:opacity-50">{loading ? 'Chargement…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}</button>
        </form>
        <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }} className="mt-5 font-body text-sm font-medium text-sauge hover:underline">
          {mode === 'login' ? 'Créer un compte salarié' : 'J’ai déjà un compte'}
        </button>
      </section>
    </main>
  );
}
