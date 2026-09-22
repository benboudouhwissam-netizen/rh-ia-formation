import { PerformanceEventsController } from './performance-events.controller';
describe('PerformanceEventsController', () => { it('liste les événements', async () => { const service: any = { findForUser: jest.fn().mockResolvedValue([]) }; await new PerformanceEventsController(service).findForUser('u'); expect(service.findForUser).toHaveBeenCalledWith('u'); }); });
