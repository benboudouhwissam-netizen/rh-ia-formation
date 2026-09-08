import { expect, test } from '@playwright/test';

const API_URL = 'http://localhost:3000/api';
const DEFAULT_POSTE_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

test('un employé peut créer son compte, se connecter et récupérer son profil', async ({ request }) => {
  const email = `e2e-auth-${crypto.randomUUID()}@entreprise.ma`;
  const password = 'MotDePasseE2E123!';

  const registerResponse = await request.post(`${API_URL}/auth/register`, {
    data: {
      nom_complet: 'Amal El Fassi', email_professionnel: email,
      mot_de_passe: password, poste_id: DEFAULT_POSTE_ID,
    },
  });
  expect(registerResponse.ok(), await registerResponse.text()).toBeTruthy();
  const registered = await registerResponse.json() as { token: string; employee: { id: string; email_professionnel: string } };
  expect(registered.employee.email_professionnel).toBe(email);

  const meResponse = await request.get(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${registered.token}` },
  });
  expect(meResponse.ok()).toBeTruthy();
  expect((await meResponse.json()).id).toBe(registered.employee.id);

  const logoutResponse = await request.post(`${API_URL}/auth/logout`, {
    headers: { Authorization: `Bearer ${registered.token}` },
  });
  expect(logoutResponse.ok()).toBeTruthy();

  const loginResponse = await request.post(`${API_URL}/auth/login`, {
    data: { email_professionnel: email, mot_de_passe: password },
  });
  expect(loginResponse.ok()).toBeTruthy();
  const loggedIn = await loginResponse.json() as { employee: { id: string } };
  expect(loggedIn.employee.id).toBe(registered.employee.id);
});
