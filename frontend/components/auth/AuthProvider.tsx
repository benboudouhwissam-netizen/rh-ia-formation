'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';
const STORAGE_KEY = 'rh-ia-employee-session';

export type EmployeeProfile = {
  id: string;
  nom_complet: string;
  email_professionnel: string;
  poste_id: string;
  avatar_url?: string | null;
  type_contrat?: 'CDI' | 'CDD' | null;
  matricule?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  hire_date?: string | null;
  status?: string | null;
  job_title?: string | null;
};

type AuthContextValue = {
  employee: EmployeeProfile | null;
  ready: boolean;
  register: (input: { nomComplet: string; email: string; password: string; posteId: string; typeContrat: 'CDI' | 'CDD' }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (input: Partial<EmployeeProfile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type StoredSession = { token: string; employee: EmployeeProfile };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) { setReady(true); return; }
    try {
      const session = JSON.parse(saved) as StoredSession;
      fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${session.token}` } })
        .then(async (response) => response.ok ? response.json() as Promise<EmployeeProfile> : Promise.reject())
        .then((profile) => { setToken(session.token); setEmployee(profile); })
        .catch(() => window.localStorage.removeItem(STORAGE_KEY))
        .finally(() => setReady(true));
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      setReady(true);
    }
  }, []);

  const saveSession = (session: StoredSession) => {
    setToken(session.token);
    setEmployee(session.employee);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  };

  const request = async (path: string, body: unknown) => {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message ?? 'Une erreur est survenue.');
    return data as StoredSession;
  };

  const value = useMemo<AuthContextValue>(() => ({
    employee,
    ready,
    register: async (input) => saveSession(await request('/auth/register', {
      nom_complet: input.nomComplet, email_professionnel: input.email,
      mot_de_passe: input.password, poste_id: input.posteId, type_contrat: input.typeContrat,
    })),
    login: async (email, password) => saveSession(await request('/auth/login', {
      email_professionnel: email, mot_de_passe: password,
    })),
    logout: async () => {
      if (token) await fetch(`${API_URL}/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
      if (employee) window.localStorage.setItem('rh-ia-last-employee', JSON.stringify({ id: employee.id, nom_complet: employee.nom_complet }));
      setToken(null); setEmployee(null); window.localStorage.removeItem(STORAGE_KEY);
    },
    updateProfile: async (input) => {
      if (!token) throw new Error('Authentification requise.');
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message ?? 'Impossible de mettre à jour le profil.');
      saveSession({ token, employee: data as EmployeeProfile });
      window.dispatchEvent(new Event('rh-notifications-refresh'));
    },
  }), [employee, ready, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider.');
  return context;
}
