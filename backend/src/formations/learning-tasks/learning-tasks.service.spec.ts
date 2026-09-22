import { LearningTasksService } from './learning-tasks.service';

describe('LearningTasksService', () => {
  const repo: any = { create: jest.fn((x) => x), save: jest.fn(), find: jest.fn() };
  let service: LearningTasksService;
  beforeEach(() => { jest.clearAllMocks(); service = new LearningTasksService(repo); });
  it('crée une tâche', async () => {
    repo.save.mockResolvedValue({ id: 'task-1' });
    await expect(service.create({ utilisateur_id: 'u', type: 'quiz', reference_id: 'r', message: 'm', payload: {} } as any)).resolves.toEqual({ id: 'task-1' });
    expect(repo.create).toHaveBeenCalled();
  });
  it('liste les tâches par utilisateur, de la plus récente à la plus ancienne', async () => {
    repo.find.mockResolvedValue([]);
    await service.findForUser('u');
    expect(repo.find).toHaveBeenCalledWith({ where: { utilisateur_id: 'u' }, order: { created_at: 'DESC' } });
  });
});
