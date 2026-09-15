'use client';

import { FormEvent, useState } from 'react';
import { AppShell } from '../../components/ui/AppShell';
import AISignature from '../../components/ui/AISignature';

const RESPONSIBLE_EMAIL = 'responsable-formation@rh-ia.local';

export default function SupportPage() {
  const [sent, setSent] = useState(false);
  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = String(form.get('subject') ?? 'Question sur la Plateforme RH');
    const message = String(form.get('message') ?? '');
    window.location.href = `mailto:${RESPONSIBLE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    setSent(true);
  }

  const steps = [
    ['01', 'Choisir une formation', 'Ouvrez le catalogue, consultez la description et choisissez la formation adaptée à vos besoins.'],
    ['02', 'Sélectionner une session', 'Choisissez une date parmi les sessions programmées, puis confirmez votre inscription.'],
    ['03', 'Suivre le e-learning', 'Depuis Mes formations, ouvrez Préparez votre session et terminez les chapitres dans l’ordre.'],
    ['04', 'Passer le quiz', 'Après les chapitres, passez le quiz final. Le score requis est indiqué avant de commencer.'],
    ['05', 'Obtenir le certificat', 'En cas de réussite, le certificat est créé automatiquement et placé en priorité dans vos notifications.'],
    ['06', 'Suivre vos compétences', 'La page Compétences présente votre matrice, les écarts et les recommandations générées par l’IA.'],
  ];

  return <AppShell active="support"><div className="mx-auto max-w-6xl space-y-6">
    <header><p className="font-mono text-xs uppercase tracking-[0.18em] text-ardoise">Plateforme RH / Assistance</p><h1 className="mt-2 font-heading text-3xl font-semibold text-encre">Centre d’aide</h1><p className="mt-2 max-w-3xl font-body text-base text-ardoise">Comprenez le parcours de formation et contactez le responsable en cas de question ou de problème.</p></header>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <section className="rounded-lg border border-ardoise/20 bg-white p-5"><h2 className="font-heading text-xl font-semibold text-encre">Comment utiliser la plateforme</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">{steps.map(([number, title, description]) => <article key={number} className="border-l-2 border-sauge pl-3"><p className="font-mono text-[11px] text-sauge">{number}</p><h3 className="mt-1 font-heading text-base font-semibold text-encre">{title}</h3><p className="mt-1 font-body text-xs leading-5 text-ardoise">{description}</p></article>)}</div></section>
        <section className="rounded-lg border border-ardoise/20 bg-white p-5"><h2 className="font-heading text-xl font-semibold text-encre">Questions fréquentes</h2><div className="mt-4 space-y-3 font-body text-sm text-ardoise"><p><strong className="text-encre">Je ne vois pas le quiz.</strong> Terminez tous les chapitres et vérifiez votre inscription.</p><p><strong className="text-encre">Mon certificat n’apparaît pas.</strong> Actualisez les notifications après la soumission du quiz.</p><p><strong className="text-encre">Une compétence n’est pas à jour.</strong> Consultez la matrice puis contactez le responsable.</p></div></section>
      </div>
      <aside className="space-y-5">
        <section className="h-fit rounded-lg border border-ardoise/20 bg-white p-5"><h2 className="font-heading text-lg font-semibold text-encre">Contacter le responsable</h2><p className="mt-2 font-body text-xs text-ardoise">Votre messagerie s’ouvrira avec le destinataire et le sujet préremplis.</p><form onSubmit={sendMessage} className="mt-4 space-y-3"><label className="block font-body text-xs font-medium text-encre">Sujet<input name="subject" required defaultValue="Question sur la Plateforme RH" className="mt-1 w-full rounded-lg border border-ardoise/20 px-3 py-2 text-xs focus:border-sauge focus:outline-none" /></label><label className="block font-body text-xs font-medium text-encre">Message<textarea name="message" required rows={5} placeholder="Décrivez votre question ou le problème rencontré…" className="mt-1 w-full rounded-lg border border-ardoise/20 px-3 py-2 text-xs focus:border-sauge focus:outline-none" /></label><button type="submit" className="w-full rounded-md bg-sauge px-3 py-2.5 font-body text-sm font-semibold text-white hover:bg-sauge-700">Envoyer au responsable</button></form>{sent && <p role="status" className="mt-3 font-body text-xs text-sauge">Votre messagerie a été ouverte.</p>}</section>
        <section className="border-l-2 border-dashed border-ocre bg-ocre/5 p-4"><div className="flex items-center"><AISignature /></div><h2 className="mt-2 font-heading text-base font-semibold text-encre">Recommandation IA</h2><p className="mt-1 font-body text-xs leading-5 text-ardoise">Vérifiez vos notifications, la session choisie et le statut du quiz avant de contacter le responsable. Ajoutez la formation et la date dans votre message.</p></section>
      </aside>
    </div>
  </div></AppShell>;
}
