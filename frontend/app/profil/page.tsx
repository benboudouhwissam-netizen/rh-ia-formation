'use client';

import Link from 'next/link';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../../components/auth/AuthProvider';
import { AppShell } from '../../components/ui/AppShell';
import AISignature from '../../components/ui/AISignature';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';
const POSTS = [
  { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', label: 'Développeur frontend' },
  { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', label: 'Ingénieur logiciel senior' },
  { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', label: 'Architecte cloud' },
  { id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', label: 'Chef de projet formation' },
  { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', label: 'Responsable RH' },
  { id: 'ffffffff-ffff-ffff-ffff-ffffffffffff', label: 'DevOps' },
];
type Certification = { id: string; nom_certification: string; date_obtention: string };
type Enrollment = { id: string; statut: string; training_session?: { formation?: { titre: string }; date_debut?: string } };
type Contract = { id: string; type: string; status: string; start_date: string; end_date?: string; job_title?: string; salary?: number };
type Diploma = { id: string; title: string; institution: string; field?: string; year?: number };
type EmployeeDocument = { id: string; category: string; title: string; mime_type?: string; size_bytes?: number; created_at: string };
type ProfileForm = { nom_complet: string; email_professionnel: string; poste_id: string; avatar_url: string; matricule: string; first_name: string; last_name: string; phone: string; birth_date: string; address: string; city: string; postal_code: string; country: string; hire_date: string; status: string; job_title: string };

function initials(name: string) { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((item) => item[0]).join('').toUpperCase(); }
function postLabel(id: string) { return POSTS.find((post) => post.id === id)?.label ?? 'Poste non renseigné'; }

async function compactAvatar(file: File) {
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Impossible de lire cette image.'));
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image(); element.onload = () => resolve(element); element.onerror = () => reject(new Error('Cette image est invalide.')); element.src = source;
  });
  const longestSide = Math.max(image.width, image.height);
  const scale = Math.min(1, 480 / longestSide);
  const canvas = document.createElement('canvas'); canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Impossible de préparer cette image.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.8);
}

export default function ProfilPage() {
  const { employee, ready, updateProfile } = useAuth();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [form, setForm] = useState<ProfileForm>({ nom_complet: '', email_professionnel: '', poste_id: '', avatar_url: '', matricule: '', first_name: '', last_name: '', phone: '', birth_date: '', address: '', city: '', postal_code: '', country: '', hire_date: '', status: 'actif', job_title: '' });
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lot3Saving, setLot3Saving] = useState(false);
  const [contractForm, setContractForm] = useState({ type: 'CDI', status: 'actif', start_date: '', end_date: '', job_title: '', salary: '' });
  const [diplomaForm, setDiplomaForm] = useState({ title: '', institution: '', field: '', year: '' });
  const [documentForm, setDocumentForm] = useState({ category: 'autre', title: '', storage_key: '', mime_type: '' });

  const fillForm = () => {
    if (!employee) return;
    setForm({ nom_complet: employee.nom_complet, email_professionnel: employee.email_professionnel, poste_id: employee.poste_id, avatar_url: employee.avatar_url ?? '', matricule: employee.matricule ?? '', first_name: employee.first_name ?? '', last_name: employee.last_name ?? '', phone: employee.phone ?? '', birth_date: employee.birth_date ?? '', address: employee.address ?? '', city: employee.city ?? '', postal_code: employee.postal_code ?? '', country: employee.country ?? '', hire_date: employee.hire_date ?? '', status: employee.status ?? 'actif', job_title: employee.job_title ?? '' });
  };
  useEffect(() => {
    if (!employee) return;
    fillForm();
    Promise.all([
      fetch(`${API_URL}/certifications/utilisateur/${employee.id}`).then((res) => res.ok ? res.json() : []),
      fetch(`${API_URL}/enrollments?utilisateur_id=${employee.id}&limit=20`).then((res) => res.ok ? res.json() : { data: [] }),
      fetch(`${API_URL}/lot3/contracts?employee_id=${employee.id}`).then((res) => res.ok ? res.json() : []),
      fetch(`${API_URL}/lot3/diplomas?employee_id=${employee.id}`).then((res) => res.ok ? res.json() : []),
      fetch(`${API_URL}/lot3/documents?employee_id=${employee.id}`).then((res) => res.ok ? res.json() : []),
    ]).then(([certs, enrollmentResult, contractResult, diplomaResult, documentResult]) => { setCertifications(certs); setEnrollments(enrollmentResult.data ?? []); setContracts(contractResult); setDiplomas(diplomaResult); setDocuments(documentResult); }).catch(() => {});
  }, [employee]);
  useEffect(() => {
    const refresh = () => window.location.reload();
    window.addEventListener('lot3-updated', refresh);
    return () => window.removeEventListener('lot3-updated', refresh);
  }, []);

  const onAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 8_000_000) { setStatus('Choisissez une image de moins de 8 Mo.'); return; }
    try {
      setStatus(null);
      const avatar_url = await compactAvatar(file);
      setForm((current) => ({ ...current, avatar_url }));
    }
    catch (error) { setStatus(error instanceof Error ? error.message : 'Impossible de préparer cette image.'); }
  };
  const save = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setStatus(null);
    try {
      const { poste_id, ...profile } = form;
      await updateProfile(poste_id === employee!.poste_id ? profile : form);
      setStatus('Profil enregistré.'); setEditing(false);
    }
    catch (error) { setStatus(error instanceof Error ? error.message : 'Impossible d’enregistrer le profil.'); }
    finally { setSaving(false); }
  };
  const cancelEdit = () => { fillForm(); setStatus(null); setEditing(false); };
  const createLot3 = async (kind: 'contracts' | 'diplomas' | 'documents') => {
    if (!employee) return;
    setLot3Saving(true);
    try {
      const payload = kind === 'contracts' ? { ...contractForm, employee_id: employee.id, end_date: contractForm.end_date || undefined, salary: contractForm.salary ? Number(contractForm.salary) : undefined } : kind === 'diplomas' ? { ...diplomaForm, employee_id: employee.id, year: diplomaForm.year ? Number(diplomaForm.year) : undefined } : { ...documentForm, employee_id: employee.id, storage_key: documentForm.storage_key || undefined, mime_type: documentForm.mime_type || undefined };
      const response = await fetch(`${API_URL}/lot3/${kind}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error('Impossible d’ajouter cette donnée.');
      const created = await response.json();
      if (kind === 'contracts') { setContracts((items) => [created, ...items]); setContractForm({ type: 'CDI', status: 'actif', start_date: '', end_date: '', job_title: '', salary: '' }); }
      if (kind === 'diplomas') { setDiplomas((items) => [created, ...items]); setDiplomaForm({ title: '', institution: '', field: '', year: '' }); }
      if (kind === 'documents') { setDocuments((items) => [created, ...items]); setDocumentForm({ category: 'autre', title: '', storage_key: '', mime_type: '' }); }
      setStatus('Donnée Lot 3 ajoutée.');
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Impossible d’ajouter cette donnée.'); }
    finally { setLot3Saving(false); }
  };

  if (!ready || !employee) return <main className="grid min-h-screen place-items-center bg-brume font-body text-ardoise">Chargement du profil…</main>;
  const avatar = editing ? form.avatar_url : employee.avatar_url;
  const displayedName = editing ? form.nom_complet : employee.nom_complet;

  return <AppShell active="formations"><div className="mx-auto max-w-6xl space-y-7">
    <header><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-sauge-700">Mon espace</p><h1 className="mt-2 font-heading text-h1 text-encre">Mon profil</h1></header>
    {editing ? <form onSubmit={save} className="rounded-xl border border-ardoise/12 bg-white p-6 shadow-sm"><div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-start"><div className="space-y-3 text-center"><div className="mx-auto h-24 w-24 overflow-hidden rounded-full bg-sauge text-white">{avatar ? <img src={avatar} alt="Photo de profil" className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center font-heading text-2xl font-bold">{initials(displayedName)}</span>}</div><label className="inline-flex cursor-pointer rounded-full border border-sauge/30 px-3 py-1.5 font-body text-xs font-semibold text-sauge-700 hover:bg-sauge/10">Changer la photo<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => void onAvatarChange(event)} /></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="font-body text-sm font-semibold text-encre">Nom complet<input value={form.nom_complet} onChange={(event) => setForm({ ...form, nom_complet: event.target.value })} required className="mt-1.5 w-full rounded-lg border border-ardoise/20 bg-white px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-sauge" /></label><label className="font-body text-sm font-semibold text-encre">E-mail professionnel<input type="email" value={form.email_professionnel} onChange={(event) => setForm({ ...form, email_professionnel: event.target.value })} required className="mt-1.5 w-full rounded-lg border border-ardoise/20 bg-white px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-sauge" /></label><label className="font-body text-sm font-semibold text-encre">Poste<select value={form.poste_id} onChange={(event) => setForm({ ...form, poste_id: event.target.value })} className="mt-1.5 w-full rounded-lg border border-ardoise/20 bg-white px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-sauge">{POSTS.map((post) => <option key={post.id} value={post.id}>{post.label}</option>)}</select></label></div></div><div className="mt-5 flex items-center justify-between border-t border-ardoise/12 pt-4"><p aria-live="polite" className={`font-body text-sm ${status?.startsWith('Profil') ? 'text-sauge-700' : 'text-alerte'}`}>{status}</p><div className="flex gap-2"><button type="button" onClick={cancelEdit} className="rounded-lg border border-ardoise/20 px-4 py-2 font-body text-sm font-semibold text-encre hover:bg-brume">Annuler</button><button type="submit" disabled={saving} className="rounded-lg bg-sauge px-4 py-2 font-body text-sm font-semibold text-white hover:bg-sauge-700 disabled:opacity-60">{saving ? 'Enregistrement…' : 'Enregistrer'}</button></div></div></form> : <section className="rounded-xl border border-ardoise/12 bg-white p-6 shadow-sm"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-5"><div className="h-20 w-20 overflow-hidden rounded-full bg-sauge text-white">{avatar ? <img src={avatar} alt="Photo de profil" className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center font-heading text-xl font-bold">{initials(displayedName)}</span>}</div><div><h2 className="font-heading text-xl font-bold text-encre">{employee.nom_complet}</h2><p className="mt-1 font-body text-ardoise">{employee.email_professionnel}</p><p className="mt-2 inline-flex rounded-full bg-sauge/10 px-3 py-1 font-body text-sm font-semibold text-sauge-700">{postLabel(employee.poste_id)}</p></div></div><button type="button" onClick={() => { setStatus(null); setEditing(true); }} className="rounded-lg bg-sauge px-4 py-2 font-body text-sm font-semibold text-white hover:bg-sauge-700">Modifier</button></div>{status && <p aria-live="polite" className="mt-4 font-body text-sm text-sauge-700">{status}</p>}</section>}
    <section className="rounded-xl border border-ocre/20 border-l-2 border-l-ocre bg-ocre/5 p-4 shadow-sm"><div className="mb-2 flex flex-wrap items-center justify-between gap-3"><AISignature /><span className="rounded-full bg-ocre/10 px-2 py-1 font-mono text-[10px] text-ocre-700">Diagnostic prédictif RH</span></div><h2 className="mt-1 font-heading text-lg font-semibold text-encre">Potentiel d’évolution identifié</h2><p className="mt-1 max-w-3xl font-body text-xs leading-5 text-ardoise">Votre profil présente un potentiel de progression. Les compétences acquises et votre parcours de formation permettent de cibler les prochaines étapes prioritaires.</p></section>
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]"><section className="rounded-xl border border-ardoise/12 bg-white p-5 shadow-sm"><p className="font-mono text-[10px] uppercase tracking-wide text-ardoise">Matrice de compétences</p><h2 className="mt-1 font-heading text-xl font-semibold text-encre">Compétences clés & évaluation des acquis</h2>{['GPEC assistée par IA','Droit du travail & RGPD','People Analytics & Visualisation','Recrutement prédictif'].map((skill, index) => <div key={skill} className="mt-4"><div className="flex items-center justify-between font-body text-xs font-semibold text-encre"><span>{skill}</span><span className="font-mono text-ardoise">{95 - index * 8}%</span></div><div className="mt-1 h-2 rounded-full bg-brume"><div className="h-full rounded-full bg-sauge" style={{ width: `${95 - index * 8}%` }} /></div></div>)}</section><section className="rounded-xl border border-ardoise/12 bg-white p-5 shadow-sm"><p className="font-mono text-[10px] uppercase tracking-wide text-ardoise">Bilan 2024</p><h2 className="mt-1 font-heading text-xl font-semibold text-encre">Performance <span className="float-right text-sauge-700">84%</span></h2>{['Déploiement grille IA interne','Taux d’adoption ateliers RH','Cartographie des métiers'].map((label, index) => <div key={label} className="mt-4"><div className="flex justify-between font-body text-[11px] text-encre"><span>{label}</span><span>{90 - index * 5}%</span></div><div className="mt-1 h-1.5 rounded-full bg-brume"><div className="h-full rounded-full bg-sauge" style={{ width: `${90 - index * 5}%` }} /></div></div>)}</section></div>
    <div className="grid gap-7 md:grid-cols-2"><section className="rounded-xl border border-ardoise/12 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-heading text-lg font-bold text-encre">Mes formations</h2><Link href="/" className="font-body text-sm font-semibold text-sauge-700 hover:underline">Catalogue</Link></div><ul className="mt-4 space-y-3">{enrollments.length ? enrollments.map((item) => <li key={item.id} className="rounded-lg bg-brume p-3"><p className="font-body text-sm font-semibold text-encre">{item.training_session?.formation?.titre ?? 'Formation inscrite'}</p><p className="mt-1 font-body text-xs text-ardoise">{item.training_session?.date_debut ? `Session le ${new Date(item.training_session.date_debut).toLocaleDateString('fr-FR')}` : item.statut}</p></li>) : <li className="font-body text-sm text-ardoise">Aucune formation suivie pour le moment.</li>}</ul></section><section className="rounded-xl border border-ardoise/12 bg-white p-6 shadow-sm"><h2 className="font-heading text-lg font-bold text-encre">Mes certificats</h2><ul className="mt-4 space-y-3">{certifications.length ? certifications.map((item) => <li key={item.id}><Link href={`/certifications/${item.id}`} className="block rounded-lg bg-brume p-3 hover:bg-sauge/10"><p className="font-body text-sm font-semibold text-encre">{item.nom_certification}</p><p className="mt-1 font-body text-xs text-ardoise">Obtenu le {new Date(item.date_obtention).toLocaleDateString('fr-FR')}</p></Link></li>) : <li className="font-body text-sm text-ardoise">Aucun certificat pour le moment.</li>}</ul></section></div>
    <section className="grid gap-7 lg:grid-cols-3"><div className="rounded-xl border border-ardoise/12 bg-white p-6 shadow-sm"><h2 className="font-heading text-lg font-bold text-encre">Contrats</h2><ul className="mt-4 space-y-3">{contracts.length ? contracts.map((item) => <li key={item.id} className="rounded-lg bg-brume p-3"><p className="font-body text-sm font-semibold text-encre">{item.job_title ?? item.type}</p><p className="mt-1 font-body text-xs text-ardoise">{item.status} · Depuis le {new Date(item.start_date).toLocaleDateString('fr-FR')}</p></li>) : <li className="font-body text-sm text-ardoise">Aucun contrat renseigné.</li>}</ul></div><div className="rounded-xl border border-ardoise/12 bg-white p-6 shadow-sm"><h2 className="font-heading text-lg font-bold text-encre">Diplômes</h2><ul className="mt-4 space-y-3">{diplomas.length ? diplomas.map((item) => <li key={item.id} className="rounded-lg bg-brume p-3"><p className="font-body text-sm font-semibold text-encre">{item.title}</p><p className="mt-1 font-body text-xs text-ardoise">{item.institution}{item.year ? ` · ${item.year}` : ''}</p></li>) : <li className="font-body text-sm text-ardoise">Aucun diplôme renseigné.</li>}</ul></div><div className="rounded-xl border border-ardoise/12 bg-white p-6 shadow-sm"><h2 className="font-heading text-lg font-bold text-encre">Documents</h2><ul className="mt-4 space-y-3">{documents.length ? documents.map((item) => <li key={item.id} className="rounded-lg bg-brume p-3"><p className="font-body text-sm font-semibold text-encre">{item.title}</p><p className="mt-1 font-body text-xs text-ardoise">{item.category} · {new Date(item.created_at).toLocaleDateString('fr-FR')}</p></li>) : <li className="font-body text-sm text-ardoise">Aucun document renseigné.</li>}</ul></div></section>
  </div></AppShell>;
}
