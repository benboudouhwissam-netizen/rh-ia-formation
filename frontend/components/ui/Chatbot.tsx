'use client';

/* Les images de formation sont distantes et contrôlées par le catalogue. */
/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { chatbotApi } from '../../lib/api';

type ChatAction = { label: string; url: string };
type ChatMessage = { role: 'assistant' | 'user'; content: string; actions?: ChatAction[] };

const suggestions = ['Quelles formations sont adaptées à mon poste ?', 'Comment modifier mon profil ?', 'Comment obtenir mon certificat ?', 'Expliquez-moi ma matrice de compétences.', 'Formations populaires', 'Formations présentielles', 'Formations e-learning', 'Quelle est la différence entre e-learning et présentiel ?', 'Comment m’inscrire à une formation ?'];
const visitorSuggestions = ['Quelles formations sont populaires ?', 'Quelle est la différence entre e-learning et présentiel ?', 'Comment m’inscrire à une formation ?', 'Voir les formations présentielles', 'Voir les formations e-learning'];
const formationImage = (title: string) => {
  const key = title.toLowerCase();
  if (key.includes('docker') || key.includes('réseau') || key.includes('cyber')) return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=500&q=80';
  if (key.includes('nest') || key.includes('backend') || key.includes('c#')) return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=500&q=80';
  if (key.includes('react') || key.includes('frontend')) return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=500&q=80';
  if (key.includes('agile') || key.includes('management')) return 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=500&q=80';
  return 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=500&q=80';
};

function ActionLink({ action, close }: { action: ChatAction; close: () => void }) {
  return <Link href={action.url} onClick={close} className="rounded-full border border-sauge/50 bg-white px-3 py-1.5 text-xs font-semibold text-sauge-700 transition hover:bg-sauge/10">{action.label}</Link>;
}

export function Chatbot() {
  const { employee } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', content: 'Bonjour ! Je suis votre assistant RH. Je peux vous aider à trouver une formation, vous guider dans la plateforme et expliquer vos compétences.' }]);
  const availableSuggestions = employee ? suggestions : visitorSuggestions;
  const send = async (event?: FormEvent, preset?: string) => {
    event?.preventDefault();
    const content = (preset ?? input).trim();
    if (!content || loading) return;
    setInput('');
    setMessages((current) => [...current, { role: 'user', content }]);
    setLoading(true);
    try {
      const response = await chatbotApi.ask(employee?.id, content);
      setMessages((current) => [...current, { role: 'assistant', content: response.message, actions: response.actions }]);
    } catch {
      setMessages((current) => [...current, { role: 'assistant', content: 'Je ne peux pas joindre le service pour le moment. Vous pouvez continuer depuis le catalogue ou le centre d’aide.' }]);
    } finally { setLoading(false); }
  };
  return <>
    {open && <section className="fixed bottom-16 right-4 z-50 flex h-[min(580px,calc(100vh-5rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[22px] border border-sauge/20 bg-white text-encre shadow-2xl shadow-encre/25" aria-label="Assistant RH">
      <header className="flex items-center gap-2 border-b border-sauge-600 bg-sauge-700 px-3 py-1.5"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-sauge text-[10px] text-brume shadow-lg shadow-encre/40" aria-hidden="true"><i className="fa-solid fa-desktop" /></span><div className="min-w-0 flex-1"><p className="font-heading text-sm font-semibold tracking-tight text-brume">Assistant RH</p><p className="mt-0.5 flex items-center gap-1 font-body text-[11px] text-brume/85"><span className="h-1.5 w-1.5 rounded-full bg-sauge-300" aria-hidden="true" />En ligne</p></div><button type="button" onClick={() => setOpen(false)} aria-label="Fermer l'assistant" className="rounded-lg px-2 py-1 text-2xl leading-none text-brume/80 transition hover:bg-brume/10 hover:text-brume">×</button></header>
      <div className="chatbot-scrollbar flex-1 space-y-4 overflow-y-auto px-5 py-5" aria-live="polite">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={message.role === 'user' ? 'ml-10' : 'mr-8'}><div className={message.role === 'user' ? 'rounded-[20px] rounded-br-md bg-sauge px-4 py-3 text-[15px] font-medium leading-6 text-brume shadow-sm' : 'rounded-[20px] rounded-bl-md bg-brume px-4 py-3 text-[15px] leading-6 text-encre'}><p className="whitespace-pre-line">{message.content}</p>{message.actions && <div className="mt-3 flex flex-wrap gap-2">{message.actions.map((action) => <ActionLink key={action.url} action={action} close={() => setOpen(false)} />)}</div>}</div>{message.role === 'assistant' && message.actions?.some((action) => action.url.startsWith('/formations/')) && <div className="mt-3 grid gap-2">{message.actions.filter((action) => action.url.startsWith('/formations/')).map((action) => <Link key={`card-${action.url}`} href={action.url} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl border border-sauge/25 bg-white p-2 shadow-sm transition hover:border-sauge hover:bg-sauge-50"><img src={formationImage(action.label)} alt="" className="h-12 w-16 rounded-lg object-cover" /><span className="text-xs font-semibold leading-4 text-encre">{action.label}</span></Link>)}</div>}</div>)}{loading && <div className="mr-8 rounded-[20px] rounded-bl-md bg-brume px-4 py-3 text-sm leading-5 text-encre">Je prépare votre réponse…</div>}</div>
      <div className="border-t border-ardoise/20 bg-encre px-4 pb-4 pt-3"><div className="chatbot-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">{availableSuggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => void send(undefined, suggestion)} className="shrink-0 rounded-full border border-ardoise-600/70 bg-ardoise-800 px-3 py-1.5 text-xs text-ardoise-200 transition hover:border-sauge-300 hover:text-brume">{suggestion}</button>)}</div><form onSubmit={(event) => void send(event)} className="flex items-center gap-2 rounded-[17px] bg-ardoise-800 p-1.5 pl-4 ring-1 ring-ardoise/30 focus-within:ring-2 focus-within:ring-sauge"><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Tapez votre message..." aria-label="Message à l'assistant RH" className="min-w-0 flex-1 bg-transparent py-2 text-sm text-brume outline-none placeholder:text-ardoise-400" /><button type="submit" disabled={loading || !input.trim()} aria-label="Envoyer le message" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-sauge text-xl text-brume transition hover:bg-sauge-600 disabled:cursor-not-allowed disabled:opacity-40">➤</button></form></div>
    </section>}
    <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Fermer l'assistant RH" : "Ouvrir l'assistant RH"} className="fixed bottom-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-sauge text-base text-brume shadow-xl shadow-encre/40 transition hover:scale-105 hover:bg-sauge-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sauge-300 focus-visible:ring-offset-2 focus-visible:ring-offset-brume">{open ? '×' : <i className="fa-regular fa-message" aria-hidden="true" />}</button>
  </>;
}
