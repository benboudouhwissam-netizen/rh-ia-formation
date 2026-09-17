import { Test, TestingModule } from '@nestjs/testing';

import { FormationsController } from './formations.controller';
import { FormationsService } from './formations.service';

describe('FormationsController', () => {
  let controller: FormationsController;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormationsController],
      providers: [
        {
          provide: FormationsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<FormationsController>(FormationsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('GET /api/formations - should return all formations', async () => {
    const result = [
      {
        id: '1',
        titre: 'Formation NestJS',
        categorie: 'Backend',
        statut: 'active',
      },
      {
        id: '2',
        titre: 'Formation React',
        categorie: 'Frontend',
        statut: 'active',
      },
    ];

    mockService.findAll.mockResolvedValue(result);

    const response = await controller.findAll({});

    expect(response).toEqual(result);
    expect(mockService.findAll).toHaveBeenCalledWith({});
    expect(mockService.findAll).toHaveBeenCalledTimes(1);
  });

  it('GET /api/formations?limit=3&offset=0 - should apply pagination', async () => {
    const filter = {
      limit: 3,
      offset: 0,
    };

    const result = [
      { id: '1', titre: 'Formation 1' },
      { id: '2', titre: 'Formation 2' },
      { id: '3', titre: 'Formation 3' },
    ];

    mockService.findAll.mockResolvedValue(result);

    const response = await controller.findAll(filter);

    expect(response).toEqual(result);
    expect(mockService.findAll).toHaveBeenCalledWith(filter);
  });

  it('GET /api/formations?categorie=Backend - should filter by categorie', async () => {
    const filter = {
      categorie: 'Backend',
    };

    const result = [
      {
        id: '1',
        titre: 'Formation NestJS',
        categorie: 'Backend',
      },
    ];

    mockService.findAll.mockResolvedValue(result);

    const response = await controller.findAll(filter);

    expect(response).toEqual(result);
    expect(mockService.findAll).toHaveBeenCalledWith(filter);
  });

  it('GET /api/formations?statut=active - should filter by statut', async () => {
    const filter = {
      statut: 'active',
    };

    const result = [
      {
        id: '1',
        titre: 'Formation NestJS',
        statut: 'active',
      },
    ];

    mockService.findAll.mockResolvedValue(result);

    const response = await controller.findAll(filter);

    expect(response).toEqual(result);
    expect(mockService.findAll).toHaveBeenCalledWith(filter);
  });

  it('GET /api/formations/:id - should return one formation', async () => {
    const id = '1';

    const result = {
      id: '1',
      titre: 'Formation NestJS',
      categorie: 'Backend',
    };

    mockService.findOne.mockResolvedValue(result);

    const response = await controller.findOne(id);

    expect(response).toEqual(result);
    expect(mockService.findOne).toHaveBeenCalledWith(id);
    expect(mockService.findOne).toHaveBeenCalledTimes(1);
  });

  it('GET /api/formations/:id - should propagate service errors', async () => {
    const id = '999';

    const error = new Error("Formation avec l'id 999 introuvable");

    mockService.findOne.mockRejectedValue(error);

    await expect(controller.findOne(id)).rejects.toThrow(
      "Formation avec l'id 999 introuvable",
    );

    expect(mockService.findOne).toHaveBeenCalledWith(id);
  });

  it('GET /api/formations - should propagate service errors', async () => {
    const error = new Error('Erreur lors de la récupération des formations');

    mockService.findAll.mockRejectedValue(error);

    await expect(controller.findAll({})).rejects.toThrow(
      'Erreur lors de la récupération des formations',
    );
  });

  it('POST /api/formations - should create a formation', async () => {
    const createData = {
      titre: 'Formation NestJS',
      description: 'Formation backend',
      categorie: 'Backend',
      duree: 20,
      statut: 'active',
    };

    const result = {
      id: '1',
      ...createData,
    };

    mockService.create.mockResolvedValue(result);

    const response = await controller.create(createData);

    expect(response).toEqual(result);

    expect(mockService.create).toHaveBeenCalledWith(createData);

    expect(mockService.create).toHaveBeenCalledTimes(1);
  });

  it('POST /api/formations - should propagate service errors', async () => {
    const createData = {
      titre: 'Formation NestJS',
    };

    const error = new Error('Erreur lors de la création de la formation');

    mockService.create.mockRejectedValue(error);

    await expect(controller.create(createData)).rejects.toThrow(
      'Erreur lors de la création de la formation',
    );

    expect(mockService.create).toHaveBeenCalledWith(createData);
  });

  it('PUT /api/formations/:id - should update a formation', async () => {
    const id = '1';

    const updateData = {
      titre: 'Nouveau titre',
      duree: 25,
    };

    const result = {
      id: '1',
      titre: 'Nouveau titre',
      duree: 25,
    };

    mockService.update.mockResolvedValue(result);

    const response = await controller.update(id, updateData);

    expect(response).toEqual(result);

    expect(mockService.update).toHaveBeenCalledWith(id, updateData);

    expect(mockService.update).toHaveBeenCalledTimes(1);
  });

  it('PUT /api/formations/:id - should propagate service errors', async () => {
    const id = '999';

    const updateData = {
      titre: 'Nouvelle formation',
    };

    const error = new Error("Formation avec l'id 999 introuvable");

    mockService.update.mockRejectedValue(error);

    await expect(controller.update(id, updateData)).rejects.toThrow(
      "Formation avec l'id 999 introuvable",
    );
  });

  it('DELETE /api/formations/:id - should delete a formation', async () => {
    const id = '1';

    mockService.remove.mockResolvedValue(undefined);

    const response = await controller.remove(id);

    expect(response).toBeUndefined();

    expect(mockService.remove).toHaveBeenCalledWith(id);
    expect(mockService.remove).toHaveBeenCalledTimes(1);
  });

  it('DELETE /api/formations/:id - should propagate service errors', async () => {
    const id = '999';

    const error = new Error("Formation avec l'id 999 introuvable");

    mockService.remove.mockRejectedValue(error);

    await expect(controller.remove(id)).rejects.toThrow(
      "Formation avec l'id 999 introuvable",
    );

    expect(mockService.remove).toHaveBeenCalledWith(id);
  });
});
