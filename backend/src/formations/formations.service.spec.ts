import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FormationsService } from './formations.service';
import { Formation } from './entities/formation.entity';
import { Competence } from '../competences/entities/competence.entity';
import { FormationCompetence } from './entities/formation-competence.entity';

import { AiService } from '../ai/ai.service';

describe('FormationsService', () => {
  let service: FormationsService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockCompetenceRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockFormationCompetenceRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockAiService = {
    generateEmbedding: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          FormationsService,

          {
            provide: getRepositoryToken(Formation),
            useValue: mockRepository,
          },

          {
            provide: getRepositoryToken(Competence),
            useValue: mockCompetenceRepository,
          },

          {
            provide: getRepositoryToken(FormationCompetence),
            useValue: mockFormationCompetenceRepository,
          },

          {
            provide: AiService,
            useValue: mockAiService,
          },
        ],
      }).compile();

    service = module.get<FormationsService>(
      FormationsService,
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll - should return all formations', async () => {
    const result = [
      {
        id: '1',
        titre: 'Formation NestJS',
        description: 'Formation backend',
        categorie: 'Backend',
        duree: 20,
        statut: 'active',
      },
      {
        id: '2',
        titre: 'Formation React',
        description: 'Formation frontend',
        categorie: 'Frontend',
        duree: 15,
        statut: 'active',
      },
    ];

    mockRepository.find.mockResolvedValue(result);

    const response = await service.findAll({});

    expect(response).toEqual(result);

    expect(mockRepository.find).toHaveBeenCalledWith({
      where: {},
      take: undefined,
      skip: undefined,
      order: {
        created_at: 'DESC',
      },
    });

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
  });

  it('findAll - should apply pagination', async () => {
    const filter = {
      limit: 3,
      offset: 0,
    };

    const result = [
      {
        id: '1',
        titre: 'Formation NestJS',
      },
      {
        id: '2',
        titre: 'Formation React',
      },
      {
        id: '3',
        titre: 'Formation Python',
      },
    ];

    mockRepository.find.mockResolvedValue(result);

    const response = await service.findAll(filter);

    expect(response).toEqual(result);

    expect(mockRepository.find).toHaveBeenCalledWith({
      where: {},
      take: 3,
      skip: 0,
      order: {
        created_at: 'DESC',
      },
    });
  });

  it('findAll - should filter by categorie', async () => {
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

    mockRepository.find.mockResolvedValue(result);

    const response = await service.findAll(filter);

    expect(response).toEqual(result);

    expect(mockRepository.find).toHaveBeenCalledWith({
      where: {
        categorie: 'Backend',
      },
      take: undefined,
      skip: undefined,
      order: {
        created_at: 'DESC',
      },
    });
  });

  it('findAll - should filter by statut', async () => {
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

    mockRepository.find.mockResolvedValue(result);

    const response = await service.findAll(filter);

    expect(response).toEqual(result);

    expect(mockRepository.find).toHaveBeenCalledWith({
      where: {
        statut: 'active',
      },
      take: undefined,
      skip: undefined,
      order: {
        created_at: 'DESC',
      },
    });
  });

  it('findAll - should apply multiple filters', async () => {
    const filter = {
      categorie: 'Backend',
      statut: 'active',
    };

    const result = [
      {
        id: '1',
        titre: 'Formation NestJS',
        categorie: 'Backend',
        statut: 'active',
      },
    ];

    mockRepository.find.mockResolvedValue(result);

    const response = await service.findAll(filter);

    expect(response).toEqual(result);

    expect(mockRepository.find).toHaveBeenCalledWith({
      where: {
        categorie: 'Backend',
        statut: 'active',
      },
      take: undefined,
      skip: undefined,
      order: {
        created_at: 'DESC',
      },
    });
  });

  it('findOne - should return one formation', async () => {
    const id = '1';

    const result = {
      id: '1',
      titre: 'Formation NestJS',
      description: 'Formation backend',
      categorie: 'Backend',
      duree: 20,
      statut: 'active',
    };

    mockRepository.findOne.mockResolvedValue(result);

    const response = await service.findOne(id);

    expect(response).toEqual(result);

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: {
        id,
      },
    });

    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
  });

  it('findOne - should throw an error when formation does not exist', async () => {
    const id = '999';

    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(id)).rejects.toThrow(
      "Formation avec l'id 999 introuvable",
    );

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: {
        id,
      },
    });
  });

  it('create - should create a formation', async () => {
    const createData = {
      titre: 'Formation NestJS',
      description: 'Formation backend',
      categorie: 'Backend',
      duree: 20,
      statut: 'active',
    };

    const formation = {
      id: '1',
      ...createData,
    };

    mockRepository.create.mockReturnValue(formation);
    mockRepository.save.mockResolvedValue(formation);

    const response = await service.create(createData);

    expect(response).toEqual(formation);

    expect(mockRepository.create).toHaveBeenCalledWith(
      createData,
    );

    expect(mockRepository.create).toHaveBeenCalledTimes(1);

    expect(mockRepository.save).toHaveBeenCalledWith(
      formation,
    );

    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('create - should propagate repository errors', async () => {
    const createData = {
      titre: 'Formation NestJS',
      description: 'Formation backend',
      categorie: 'Backend',
      duree: 20,
      statut: 'active',
    };

    const error = new Error(
      'Erreur lors de la création de la formation',
    );

    mockRepository.create.mockReturnValue(createData);
    mockRepository.save.mockRejectedValue(error);

    await expect(
      service.create(createData),
    ).rejects.toThrow(
      'Erreur lors de la création de la formation',
    );

    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('update - should update a formation', async () => {
    const id = '1';

    const formation = {
      id: '1',
      titre: 'Ancien titre',
      description: 'Ancienne description',
      categorie: 'Backend',
      duree: 20,
      statut: 'active',
    };

    const updateData = {
      titre: 'Nouveau titre',
      duree: 25,
    };

    mockRepository.findOne.mockResolvedValue(formation);
    mockRepository.save.mockResolvedValue({
      ...formation,
      ...updateData,
    });

    const response = await service.update(
      id,
      updateData,
    );

    expect(response).toEqual({
      ...formation,
      ...updateData,
    });

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: {
        id,
      },
    });

    expect(mockRepository.save).toHaveBeenCalledWith(
      formation,
    );
  });

  it('update - should throw an error when formation does not exist', async () => {
    const id = '999';

    mockRepository.findOne.mockResolvedValue(null);

    await expect(
      service.update(id, {
        titre: 'Nouvelle formation',
      }),
    ).rejects.toThrow(
      "Formation avec l'id 999 introuvable",
    );

    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('remove - should remove a formation', async () => {
    const id = '1';

    const formation = {
      id: '1',
      titre: 'Formation NestJS',
      categorie: 'Backend',
      duree: 20,
      statut: 'active',
    };

    mockRepository.findOne.mockResolvedValue(formation);
    mockRepository.remove.mockResolvedValue(formation);

    await service.remove(id);

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: {
        id,
      },
    });

    expect(mockRepository.remove).toHaveBeenCalledWith(
      formation,
    );

    expect(mockRepository.remove).toHaveBeenCalledTimes(1);
  });

  it('remove - should throw an error when formation does not exist', async () => {
    const id = '999';

    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.remove(id)).rejects.toThrow(
      "Formation avec l'id 999 introuvable",
    );

    expect(mockRepository.remove).not.toHaveBeenCalled();
  });
});