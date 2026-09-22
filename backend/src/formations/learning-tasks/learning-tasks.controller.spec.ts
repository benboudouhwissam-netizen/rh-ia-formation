import { LearningTasksController } from './learning-tasks.controller';
describe('LearningTasksController', () => { it('liste les tâches', async () => { const service: any = { findForUser: jest.fn().mockResolvedValue([]) }; await new LearningTasksController(service).findForUser('u'); expect(service.findForUser).toHaveBeenCalledWith('u'); }); });
