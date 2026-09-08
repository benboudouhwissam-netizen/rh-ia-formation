import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3000/api';

test.describe('Intégration Formation - Compétences', () => {

  test('détection des écarts et génération des recommandations', async ({ request }) => {

    const utilisateurId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const posteId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

    const response = await request.get(
      `${API_URL}/competences/recommendations/${utilisateurId}?posteId=${posteId}`,
    );

    expect(response.ok()).toBeTruthy();

    const data = await response.json();

    expect(data).toHaveProperty('utilisateur_id');
    expect(data).toHaveProperty('poste_id');
    expect(data).toHaveProperty('recommandations');

    expect(data.utilisateur_id).toBe(utilisateurId);
    expect(data.poste_id).toBe(posteId);

    expect(Array.isArray(data.recommandations)).toBeTruthy();

    expect(data.recommandations.length).toBeGreaterThan(0);

    const recommandation = data.recommandations[0];

    expect(recommandation).toHaveProperty('formation_id');
    expect(recommandation).toHaveProperty('competence_id');
    expect(recommandation).toHaveProperty('competence_nom');
    expect(recommandation).toHaveProperty('current_level');
    expect(recommandation).toHaveProperty('required_level');
    expect(recommandation).toHaveProperty('gap');
    expect(recommandation).toHaveProperty('score_pertinence');

    expect(recommandation.gap).toBe(
      recommandation.required_level - recommandation.current_level,
    );

    expect(recommandation.gap).toBeGreaterThan(0);

    expect(recommandation.score_pertinence).toBeGreaterThanOrEqual(0);
    expect(recommandation.score_pertinence).toBeLessThanOrEqual(1);
  });

  test('une formation recommandée peut être récupérée', async ({ request }) => {

    const utilisateurId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const posteId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

    const recommendationsResponse = await request.get(
        `${API_URL}/competences/recommendations/${utilisateurId}?posteId=${posteId}`,
    );

    expect(recommendationsResponse.ok()).toBeTruthy();

    const recommendations = await recommendationsResponse.json();

    expect(recommendations.recommandations.length).toBeGreaterThan(0);

    const formationId =
        recommendations.recommandations[0].formation_id;

    const formationResponse = await request.get(
        `${API_URL}/formations/${formationId}`,
    );

    expect(formationResponse.ok()).toBeTruthy();

    const formation = await formationResponse.json();

    expect(formation.id).toBe(formationId);
    expect(formation.titre).toBeTruthy();
    });
});