import { ChatbotService } from './chatbot.service';

describe('ChatbotService', () => {
  const dataSource = { query: jest.fn() } as any;
  let service: ChatbotService;
  beforeEach(() => { jest.clearAllMocks(); service = new ChatbotService(dataSource); });

  it('répond à une question visiteur sur les modalités', async () => {
    const result = await service.answer('', 'Quelle est la différence entre e-learning et présentiel ?');
    expect(result.message).toContain('e-learning');
    expect(result.actions[0].url).toBe('/');
    expect(dataSource.query).not.toHaveBeenCalled();
  });

  it('répond à une question visiteur sur l inscription', async () => {
    const result = await service.answer('', 'Comment m inscrire ?');
    expect(result.message).toContain('inscrire');
  });

  it('recherche une formation publique par catégorie', async () => {
    dataSource.query
      .mockResolvedValueOnce([{ categorie: 'Backend' }])
      .mockResolvedValueOnce([{ id: 'f1', titre: 'NestJS', niveau: 'Intermédiaire' }]);
    const result = await service.answer('', 'formations backend');
    expect(result.message).toContain('NestJS');
    expect(result.actions[0].url).toBe('/formations/f1');
  });

  it('répond à un employé introuvable', async () => {
    dataSource.query.mockResolvedValueOnce([]);
    const result = await service.answer('missing', 'mes certificats');
    expect(result.message).toContain('session employé');
    expect(result.actions[0].url).toBe('/connexion');
  });

  it('répond aux formations e-learning demandées par un employé', async () => {
    dataSource.query
      .mockResolvedValueOnce([{ nom_complet: 'Test', poste_id: 'p1' }])
      .mockResolvedValueOnce([{ id: 'f1', titre: 'React', niveau: 'Débutant' }]);
    const result = await service.answer('u1', 'formations e-learning');
    expect(result.message).toContain('React');
    expect(result.actions[0].url).toBe('/formations/f1');
  });

  it('refuse une question hors périmètre', async () => {
    dataSource.query.mockResolvedValueOnce([{ nom_complet: 'Test', poste_id: 'p1' }]);
    const result = await service.answer('u1', 'quelle est la météo ?');
    expect(result.message).toContain('uniquement');
  });
});
