import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';

describe('EnrollmentsController', () => {
  let controller: EnrollmentsController;

  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnrollmentsController],
      providers: [
        {
          provide: EnrollmentsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<EnrollmentsController>(EnrollmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /api/enrollments', () => {
    it('should return all enrollments', async () => {
      const result = {
        data: [
          {
            id: '1',
            utilisateur_id: 'user-1',
            training_session_id: 'session-1',
            statut: 'active',
          },
        ],
        total: 1,
        limit: 10,
        offset: 0,
      };

      service.findAll.mockResolvedValue(result);

      expect(await controller.findAll({})).toEqual(result);

      expect(service.findAll).toHaveBeenCalledWith({});
    });

    it('should apply pagination', async () => {
      const filter = {
        limit: 3,
        offset: 6,
      };

      const result = {
        data: [],
        total: 10,
        limit: 3,
        offset: 6,
      };

      service.findAll.mockResolvedValue(result);

      expect(await controller.findAll(filter)).toEqual(result);

      expect(service.findAll).toHaveBeenCalledWith(filter);
    });

    it('should filter by utilisateur_id', async () => {
      const filter = {
        utilisateur_id: 'user-123',
      };

      service.findAll.mockResolvedValue({
        data: [],
        total: 0,
        limit: 10,
        offset: 0,
      });

      await controller.findAll(filter);

      expect(service.findAll).toHaveBeenCalledWith(filter);
    });

    it('should filter by training_session_id', async () => {
      const filter = {
        training_session_id: 'session-123',
      };

      service.findAll.mockResolvedValue({
        data: [],
        total: 0,
        limit: 10,
        offset: 0,
      });

      await controller.findAll(filter);

      expect(service.findAll).toHaveBeenCalledWith(filter);
    });

    it('should filter by statut', async () => {
      const filter = {
        statut: 'active',
      };

      service.findAll.mockResolvedValue({
        data: [],
        total: 0,
        limit: 10,
        offset: 0,
      });

      await controller.findAll(filter);

      expect(service.findAll).toHaveBeenCalledWith(filter);
    });

    it('should apply multiple filters', async () => {
      const filter = {
        utilisateur_id: 'user-123',
        training_session_id: 'session-123',
        statut: 'active',
        limit: 5,
        offset: 10,
      };

      service.findAll.mockResolvedValue({
        data: [],
        total: 0,
        limit: 5,
        offset: 10,
      });

      await controller.findAll(filter);

      expect(service.findAll).toHaveBeenCalledWith(filter);
    });

    it('should propagate service errors', async () => {
      const error = new Error('Database error');

      service.findAll.mockRejectedValue(error);

      await expect(controller.findAll({})).rejects.toThrow('Database error');
    });
  });

  describe('GET /api/enrollments/:id', () => {
    it('should return one enrollment', async () => {
      const enrollment = {
        id: '1',
        utilisateur_id: 'user-1',
        training_session_id: 'session-1',
        statut: 'active',
      };

      service.findOne.mockResolvedValue(enrollment);

      const result = await controller.findOne('1');

      expect(result).toEqual(enrollment);

      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('should propagate service errors', async () => {
      service.findOne.mockRejectedValue(new Error('Enrollment not found'));

      await expect(controller.findOne('999')).rejects.toThrow(
        'Enrollment not found',
      );
    });
  });

  describe('POST /api/enrollments', () => {
    it('should create an enrollment', async () => {
      const dto = {
        utilisateur_id: 'user-1',
        training_session_id: 'session-1',
        date_inscription: new Date().toISOString(),
        statut: 'active',
      };

      const enrollment = {
        id: '1',
        ...dto,
      };

      service.create.mockResolvedValue(enrollment);

      const result = await controller.create(dto);

      expect(result).toEqual(enrollment);
      expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('should propagate service errors', async () => {
      const dto = {
        utilisateur_id: 'user-1',
        training_session_id: 'session-1',
        date_inscription: new Date().toISOString(),
      };

      service.create.mockRejectedValue(new Error('Enrollment already exists'));

      await expect(controller.create(dto)).rejects.toThrow(
        'Enrollment already exists',
      );
    });
  });

  describe('PUT /api/enrollments/:id', () => {
    it('should update an enrollment', async () => {
      const dto = {
        statut: 'completed',
      };

      const enrollment = {
        id: '1',
        utilisateur_id: 'user-1',
        training_session_id: 'session-1',
        statut: 'completed',
      };

      service.update.mockResolvedValue(enrollment);

      const result = await controller.update('1', dto);

      expect(result).toEqual(enrollment);

      expect(service.update).toHaveBeenCalledWith('1', dto);
    });

    it('should propagate service errors', async () => {
      service.update.mockRejectedValue(new Error('Enrollment not found'));

      await expect(
        controller.update('999', {
          statut: 'completed',
        }),
      ).rejects.toThrow('Enrollment not found');
    });
  });

  describe('DELETE /api/enrollments/:id', () => {
    it('should delete an enrollment', async () => {
      const result = {
        message: 'Enrollment deleted successfully',
      };

      service.remove.mockResolvedValue(result);

      expect(await controller.remove('1')).toEqual(result);

      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('should propagate service errors', async () => {
      service.remove.mockRejectedValue(new Error('Enrollment not found'));

      await expect(controller.remove('999')).rejects.toThrow(
        'Enrollment not found',
      );
    });
  });
});
