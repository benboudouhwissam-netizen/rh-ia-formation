import { Test, TestingModule } from '@nestjs/testing';
import { TrainingSessionsService } from './training-sessions.service';
import { TrainingSessionsController } from './training-sessions.controller';
import { CreateTrainingSessionDto } from '../dto/create-training-session.dto';

describe('TrainingSessionsController', () => {
  let controller: TrainingSessionsController;
  let service: TrainingSessionsService;

  const mockTrainingSessionsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainingSessionsController],
      providers: [
        {
          provide: TrainingSessionsService,
          useValue: mockTrainingSessionsService,
        },
      ],
    }).compile();

    controller = module.get<TrainingSessionsController>(
      TrainingSessionsController,
    );

    service = module.get<TrainingSessionsService>(
      TrainingSessionsService,
    );

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all training sessions', async () => {
      const filterDto = {
        limit: 10,
        offset: 0,
      };

      const result = {
        data: [],
        total: 0,
        limit: 10,
        offset: 0,
      };

      mockTrainingSessionsService.findAll.mockResolvedValue(result);

      expect(await controller.findAll(filterDto)).toEqual(result);

      expect(service.findAll).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('findOne', () => {
    it('should return a training session by id', async () => {
      const id = 'b60264e5-ce42-43a7-b304-c97eb0a91242';

      const result = {
        id,
        formation_id: '0869f33e-ebc0-4733-8107-113eb37bbfeb',
        date_debut: '2026-08-20T09:00:00Z',
        date_fin: '2026-08-20T12:00:00Z',
        lieu: 'Salle de formation RH',
        capacite: 20,
        statut: 'active',
      };

      mockTrainingSessionsService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(id)).toEqual(result);

      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('create', () => {
    it('should create a training session', async () => {
      const createDto: CreateTrainingSessionDto = {
        formation_id: '0869f33e-ebc0-4733-8107-113eb37bbfeb',
        date_debut: '2026-08-20T09:00:00Z',
        date_fin: '2026-08-20T12:00:00Z',
        lieu: 'Salle de formation RH',
        capacite: 20,
        statut: 'active',
      };

      const result = {
        id: 'b60264e5-ce42-43a7-b304-c97eb0a91242',
        ...createDto,
      };

      mockTrainingSessionsService.create.mockResolvedValue(result);

      expect(await controller.create(createDto)).toEqual(result);

      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a training session', async () => {
      const id = 'b60264e5-ce42-43a7-b304-c97eb0a91242';

      const updateDto = {
        lieu: 'Salle principale RH',
        capacite: 25,
      };

      const result = {
        id,
        formation_id: '0869f33e-ebc0-4733-8107-113eb37bbfeb',
        lieu: 'Salle principale RH',
        capacite: 25,
        statut: 'active',
      };

      mockTrainingSessionsService.update.mockResolvedValue(result);

      expect(await controller.update(id, updateDto)).toEqual(result);

      expect(service.update).toHaveBeenCalledWith(
        id,
        updateDto,
      );
    });
  });

  describe('remove', () => {
    it('should delete a training session', async () => {
      const id = 'b60264e5-ce42-43a7-b304-c97eb0a91242';

      const result = {
        message: 'Training session deleted successfully',
      };

      mockTrainingSessionsService.remove.mockResolvedValue(result);

      expect(await controller.remove(id)).toEqual(result);

      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});