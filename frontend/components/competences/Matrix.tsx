'use client';

import { useEffect, useState } from 'react';
import { competenceMapApi, MatrixData } from '../../lib/api';
import { employeePresentation, isCuratedEmployee } from '../../lib/employee-presentation';
import { useAuth } from '../auth/AuthProvider';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';

const LEVEL_STYLES: Record<number, { background: string; color: string }> = {
  0: { background: '#f4f9f8', color: '#74777c' }, 1: { background: 'rgba(62,124,116,.10)', color: '#121d25' },
  2: { background: 'rgba(62,124,116,.25)', color: '#121d25' }, 3: { background: 'rgba(62,124,116,.45)', color: '#ffffff' },
  4: { background: 'rgba(62,124,116,.70)', color: '#ffffff' }, 5: { background: '#3e7c74', color: '#ffffff' },
};
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
const EMPLOYEE_COLORS = ['#b4dbd3', '#d7b96d', '#87c1b7', '#edb9b4', '#e5e8eb'];
const WISSAM_LEVELS: Record<string, number> = { python: 2, 'c++': 1, docker: 2, react: 0, 'c#': 0, nestjs: 4, kubernetes: 0, 'spring boot': 0 };
const OFFLINE_WISSAM = { id: 'wissam-benboudouh', nom_complet: 'Wissam Benboudouh' };

export function Matrix() {
  const { employee } = useAuth();
  const [data, setData] = useState<MatrixData | null>(null);
  const [expertUserIds, setExpertUserIds] = useState<string[]>([]);
  const [rememberedEmployee, setRememberedEmployee] = useState<{ id: string; nom_complet: string } | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem('rh-ia-last-employee') ?? 'null');
      if (saved?.id && saved?.nom_complet) setRememberedEmployee(saved);
    } catch { /* état local invalide ignoré */ }
    let cancelled = false;
    competenceMapApi.getMatrix().then((value) => { if (!cancelled) setData(value); }).finally(() => { if (!cancelled) setLoading(false); });
    competenceMapApi.getTopExperts(5).then((groups) => { if (!cancelled) setExpertUserIds(Array.from(new Set(groups.flatMap((group) => group.experts.map((expert) => expert.utilisateur_id))))); });
    return () => { cancelled = true; };
  }, []);
  if (loading) return <Card className="flex items-center gap-3 p-4"><Spinner size="sm" color="sauge" /><p className="font-body text-xs text-ardoise">Chargement de la matrice…</p></Card>;
  if (!data || data.utilisateurs.length === 0) return <Card className="p-4"><p className="font-body text-xs text-ardoise">Aucune donnée de compétence à afficher pour le moment.</p></Card>;
  const offlineEmployee = employee ? null : (rememberedEmployee ?? OFFLINE_WISSAM);
  const currentEmployeeId = employee?.id ?? offlineEmployee?.id;
  const levelFor = (userId: string, competenceId: string) => {
    const saved = data.cellules.find((cell) => cell.utilisateur_id === userId && cell.competence_id === competenceId);
    if (saved) return saved.niveau;
    if (userId === currentEmployeeId && (employee?.nom_complet ?? offlineEmployee?.nom_complet ?? '').toLowerCase().includes('wissam')) {
      const competence = data.competences.find((item) => item.id === competenceId);
      return WISSAM_LEVELS[(competence?.nom ?? '').toLowerCase()] ?? 0;
    }
    return 0;
  };
  const collaborators = Array.from(new Set([...data.utilisateurs, ...expertUserIds, ...(currentEmployeeId ? [currentEmployeeId] : [])])).filter((id) => {
    const hasKnownName = id === employee?.id || id === offlineEmployee?.id || employeePresentation(id).name !== 'Collaborateur interne';
    return hasKnownName && (!employee || isCuratedEmployee(id) || id === employee.id || id === offlineEmployee?.id);
  });
  const nameFor = (id: string) => id === employee?.id ? employee.nom_complet : id === offlineEmployee?.id ? offlineEmployee.nom_complet : employeePresentation(id).name;
  return <section className="space-y-3">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h2 className="font-heading text-xl font-semibold text-encre">Matrice des compétences</h2><p className="mt-1 font-body text-xs text-ardoise">Lecture des niveaux observés par collaborateur et par compétence.</p></div><p className="inline-flex w-fit items-center rounded-md border border-[#c4c6cc]/60 bg-[#ebf5ff] px-2.5 py-1.5 font-mono text-[11px] text-[#44474c]">ⓘ Échelle : 0 (non évalué) à 5 (expert)</p></div>
    <Card className="overflow-hidden p-0"><table className="matrix-table w-full table-fixed border-collapse"><thead><tr className="bg-[#d9e4ef]"><th className="w-[23%] px-2 py-2 text-left font-mono text-[10px] uppercase tracking-wide text-[#121d25]">Employé</th>{data.competences.map((competence) => <th key={competence.id} className="whitespace-normal break-words px-1 py-2 text-center font-mono text-[10px] uppercase tracking-wide text-[#121d25]">{competence.nom}</th>)}</tr></thead><tbody>{collaborators.map((id, index) => { const name = nameFor(id); return <tr key={id} className="border-t border-[#74777c]/15 bg-white"><td className="truncate px-2 py-1.5 font-body text-[11px] text-[#121d25]"><span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full font-mono text-[9px] font-semibold text-[#1c2b39]" style={{ backgroundColor: EMPLOYEE_COLORS[index % EMPLOYEE_COLORS.length] }}>{initials(name)}</span>{name}</td>{data.competences.map((competence) => { const level = levelFor(id, competence.id); const style = LEVEL_STYLES[level] ?? LEVEL_STYLES[0]; return <td key={competence.id} className="h-8 border-l border-[#74777c]/15 text-center font-mono text-[11px] font-medium" style={{ backgroundColor: style.background, color: style.color }}>{level}</td>; })}</tr>; })}</tbody></table></Card>
    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-ardoise"><span>Niveau observé</span>{[0, 1, 2, 3, 4, 5].map((level) => <span key={level} className="inline-flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: LEVEL_STYLES[level].background }} />{level}</span>)}</div>
  </section>;
}
