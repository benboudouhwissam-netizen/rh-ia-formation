export type EmployeePresentation = {
  name: string;
  role: string;
  initials: string;
};

const profiles: Record<string, EmployeePresentation> = {
  aaaaaaaa: { name: 'Amina El Idrissi', role: 'Responsable formation', initials: 'AE' },
  cccccccc: { name: 'Youssef Alaoui', role: 'Développeur backend', initials: 'YA' },
  dddddddd: { name: 'Salma Benjelloun', role: 'DevOps Lead', initials: 'SB' },
  eeeeeeee: { name: 'Imane Berrada', role: 'Analyste RH', initials: 'IB' },
  ffffffff: { name: 'Farid El Mansouri', role: 'Ingénieur logiciel', initials: 'FE' },
  'employee-emma': { name: 'Imane Berrada', role: 'Analyste RH', initials: 'IB' },
  'employee-farid': { name: 'Farid El Mansouri', role: 'Ingénieur logiciel', initials: 'FE' },
  'employee-nora': { name: 'Nora Benali', role: 'Responsable produit', initials: 'NB' },
  // Compte employé utilisé pour la démonstration du parcours certification.
  '8a2f0971': { name: 'Wissam Benboudouh', role: 'Développeur backend', initials: 'WB' },
};

// Les profils de démonstration affichés dans l'espace collaborateur. Les
// identifiants créés par les tests E2E restent en base mais ne polluent pas
// la matrice métier destinée aux utilisateurs.
export const CURATED_EMPLOYEE_IDS = new Set(Object.keys(profiles).filter((id) => id.length === 8));

export function isCuratedEmployee(id: string): boolean {
  return CURATED_EMPLOYEE_IDS.has(id.slice(0, 8).toLowerCase());
}

export function employeePresentation(id: string): EmployeePresentation {
  const profile = profiles[id.slice(0, 8).toLowerCase()];
  if (profile) return profile;

  return { name: 'Collaborateur interne', role: 'Équipe RH', initials: 'RH' };
}
