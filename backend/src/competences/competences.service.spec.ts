import { Test, TestingModule } from '@nestjs/testing';
import { CompetencesService } from './competences.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Competence } from './entities/competence.entity';
import { AiService } from '../ai/ai.service';

describe('CompetencesService - findAll', () => {
  let service: CompetencesService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    query: jest.fn(),
  };

  const mockAiService = {
    generateEmbedding: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompetencesService,
        {
          provide: getRepositoryToken(Competence),
          useValue: mockRepository,
        },
        {
          provide: AiService,
          useValue: mockAiService,
        },
      ],
    }).compile();

    service = module.get<CompetencesService>(CompetencesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll - should return all competences', async () => {
    const result = [
      {
        id: '1',
        nom: 'NestJS',
        description: 'Framework backend Node.js',
        categorie: 'Backend',
        niveau: 'Avancé',
      },
      {
        id: '2',
        nom: 'React',
        description: 'Frontend',
        categorie: 'Frontend',
        niveau: 'Débutant',
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
        nom: 'NestJS',
        categorie: 'Backend',
        niveau: 'Avancé',
      },
      {
        id: '2',
        nom: 'React',
        categorie: 'Frontend',
        niveau: 'Débutant',
      },
      {
        id: '3',
        nom: 'Python',
        categorie: 'Backend',
        niveau: 'Intermédiaire',
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

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
  });

  it('findAll - should filter by categorie', async () => {
    const filter = {
      categorie: 'Backend',
    };

    const result = [
      {
        id: '1',
        nom: 'NestJS',
        description: 'Framework backend Node.js',
        categorie: 'Backend',
        niveau: 'Avancé',
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

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
  });

  it('findAll - should filter by niveau', async () => {
    const filter = {
      niveau: 'Avancé',
    };

    const result = [
      {
        id: '1',
        nom: 'NestJS',
        description: 'Framework backend Node.js',
        categorie: 'Backend',
        niveau: 'Avancé',
      },
    ];

    mockRepository.find.mockResolvedValue(result);

    const response = await service.findAll(filter);

    expect(response).toEqual(result);

    expect(mockRepository.find).toHaveBeenCalledWith({
      where: {
        niveau: 'Avancé',
      },
      take: undefined,
      skip: undefined,
      order: {
        created_at: 'DESC',
      },
    });

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
  });

  it('findAll - should apply multiple filters', async () => {
    const filter = {
      categorie: 'Backend',
      niveau: 'Avancé',
    };

    const result = [
      {
        id: '1',
        nom: 'NestJS',
        description: 'Framework backend Node.js',
        categorie: 'Backend',
        niveau: 'Avancé',
      },
    ];

    mockRepository.find.mockResolvedValue(result);

    const response = await service.findAll(filter);

    expect(response).toEqual(result);

    expect(mockRepository.find).toHaveBeenCalledWith({
      where: {
        categorie: 'Backend',
        niveau: 'Avancé',
      },
      take: undefined,
      skip: undefined,
      order: {
        created_at: 'DESC',
      },
    });

    expect(mockRepository.find).toHaveBeenCalledTimes(1);
  });

  it('findOne - should return one competence', async () => {
    const id = '1';

    const result = {
      id: '1',
      nom: 'NestJS',
      description: 'Framework backend Node.js',
      categorie: 'Backend',
      niveau: 'Avancé',
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

  it('findOne - should throw an error when competence does not exist', async () => {
    const id = '999';

    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(id)).rejects.toThrow(
      "Compétence avec l'id 999 introuvable",
    );

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: {
        id,
      },
    });

    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
  });

  it('create - should create a competence', async () => {
    const createData = {
      nom: 'C++',
      description: 'Langage de programmation',
      categorie: 'Programmation',
      niveau: 'Avancé',
    };

    const competence = {
      id: '1',
      ...createData,
    };

    mockRepository.create.mockReturnValue(competence);
    mockRepository.save.mockResolvedValue(competence);

    const response = await service.create(createData);

    expect(response).toEqual(competence);

    expect(mockRepository.create).toHaveBeenCalledWith(createData);
    expect(mockRepository.create).toHaveBeenCalledTimes(1);

    expect(mockRepository.save).toHaveBeenCalledWith(competence);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('create - should propagate repository errors', async () => {
    const createData = {
      nom: 'C++',
      description: 'Langage de programmation',
      categorie: 'Programmation',
      niveau: 'Avancé',
    };

    const error = new Error('Erreur lors de la création de la compétence');

    mockRepository.create.mockReturnValue(createData);
    mockRepository.save.mockRejectedValue(error);

    await expect(service.create(createData)).rejects.toThrow(
      'Erreur lors de la création de la compétence',
    );

    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('update - should update a competence', async () => {
    const id = '1';

    const existingCompetence = {
      id: '1',
      nom: 'NestJS',
      description: 'Framework backend Node.js',
      categorie: 'Backend',
      niveau: 'Intermédiaire',
    };

    const updateData = {
      niveau: 'Avancé',
    };

    const updatedCompetence = {
      ...existingCompetence,
      niveau: 'Avancé',
    };

    mockRepository.findOne.mockResolvedValue(existingCompetence);
    mockRepository.save.mockResolvedValue(updatedCompetence);

    const response = await service.update(id, updateData);

    expect(response).toEqual(updatedCompetence);

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: {
        id,
      },
    });

    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);

    expect(mockRepository.save).toHaveBeenCalledWith(existingCompetence);

    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('update - should throw an error when competence does not exist', async () => {
    const id = '999';

    mockRepository.findOne.mockResolvedValue(null);

    await expect(
      service.update(id, {
        niveau: 'Avancé',
      }),
    ).rejects.toThrow("Compétence avec l'id 999 introuvable");

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: {
        id,
      },
    });

    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);

    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('remove - should remove a competence', async () => {
    const id = '1';

    const competence = {
      id: '1',
      nom: 'NestJS',
      description: 'Framework backend Node.js',
      categorie: 'Backend',
      niveau: 'Avancé',
    };

    mockRepository.findOne.mockResolvedValue(competence);
    mockRepository.remove.mockResolvedValue(competence);

    const response = await service.remove(id);

    expect(response).toBeUndefined();

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: {
        id,
      },
    });

    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);

    expect(mockRepository.remove).toHaveBeenCalledWith(competence);
    expect(mockRepository.remove).toHaveBeenCalledTimes(1);
  });

  it('searchSimilar - should return similar competences', async () => {
    const query = 'NestJS';

    const embedding = [0.1, 0.2, 0.3];

    const result = [
      {
        id: '1',
        nom: 'NestJS',
        description: 'Framework backend Node.js',
        categorie: 'Backend',
        niveau: 'Avancé',
        similarity: 0.95,
      },
    ];

    mockAiService.generateEmbedding.mockResolvedValue(embedding);
    mockRepository.query.mockResolvedValue(result);

    const response = await service.searchSimilar(query);

    expect(response).toEqual(result);

    expect(mockAiService.generateEmbedding).toHaveBeenCalledWith(query);
    expect(mockAiService.generateEmbedding).toHaveBeenCalledTimes(1);

    expect(mockRepository.query).toHaveBeenCalledTimes(1);
  });

  it('searchSimilar - should propagate AI service errors', async () => {
    const query = 'NestJS';

    const error = new Error('Erreur lors de la génération de l embedding');

    mockAiService.generateEmbedding.mockRejectedValue(error);

    await expect(service.searchSimilar(query)).rejects.toThrow(
      'Erreur lors de la génération de l embedding',
    );

    expect(mockAiService.generateEmbedding).toHaveBeenCalledWith(query);

    expect(mockAiService.generateEmbedding).toHaveBeenCalledTimes(1);

    expect(mockRepository.query).not.toHaveBeenCalled();
  });

  it('generateMissingEmbeddings - should generate and save embeddings', async () => {
    const competences = [
      {
        id: '1',
        nom: 'NestJS',
        description: 'Framework backend Node.js',
        embedding: null,
      },
      {
        id: '2',
        nom: 'React',
        description: 'Bibliothèque frontend',
        embedding: null,
      },
    ];

    const embedding1 = [0.1, 0.2, 0.3];
    const embedding2 = [0.4, 0.5, 0.6];

    mockRepository.find.mockResolvedValue(competences);

    mockAiService.generateEmbedding
      .mockResolvedValueOnce(embedding1)
      .mockResolvedValueOnce(embedding2);

    mockRepository.save
      .mockResolvedValueOnce(competences[0])
      .mockResolvedValueOnce(competences[1]);

    const response = await service.generateMissingEmbeddings();

    expect(response).toEqual({
      count: 2,
      message: 'Embeddings manquants générés avec succès',
    });

    expect(mockRepository.find).toHaveBeenCalledWith({
      where: {
        embedding: expect.anything(),
      },
    });

    expect(mockAiService.generateEmbedding).toHaveBeenNthCalledWith(
      1,
      'NestJS Framework backend Node.js',
    );

    expect(mockAiService.generateEmbedding).toHaveBeenNthCalledWith(
      2,
      'React Bibliothèque frontend',
    );

    expect(mockAiService.generateEmbedding).toHaveBeenCalledTimes(2);

    expect(mockRepository.save).toHaveBeenCalledTimes(2);
  });
});
