import { PerformanceEventsService } from './performance-events.service';

describe('PerformanceEventsService', () => {
  const repo: any = { create: jest.fn((x) => x), save: jest.fn(), find: jest.fn() };
  let service: PerformanceEventsService;
  beforeEach(() => { jest.clearAllMocks(); service = new PerformanceEventsService(repo); });
  it('publie un événement', async () => {
    repo.save.mockResolvedValue({ id: 'event-1' });
    await expect(service.publish({ utilisateur_id: 'u', type: 'quiz_termine', reference_id: 'r', payload: {} } as any)).resolves.toEqual({ id: 'event-1' });
  });
  it('liste les événements par utilisateur', async () => {
    repo.find.mockResolvedValue([]);
    await service.findForUser('u');
    expect(repo.find).toHaveBeenCalledWith({ where: { utilisateur_id: 'u' }, order: { created_at: 'DESC' } });
  });
});
