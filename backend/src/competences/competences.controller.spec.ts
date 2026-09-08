import { Test, TestingModule } from '@nestjs/testing';
import { CompetencesController } from './competences.controller';
import { CompetencesService } from './competences.service';

describe('CompetencesController - GET /api/competences', () => {
  let controller: CompetencesController;
  let service: CompetencesService;

  const mockCompetencesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    searchSimilar: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompetencesController],
      providers: [
        {
          provide: CompetencesService,
          useValue: mockCompetencesService,
        },
      ],
    }).compile();

    controller = module.get<CompetencesController>(CompetencesController);
    service = module.get<CompetencesService>(CompetencesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('GET /api/competences - should return all competences', async () => {
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

    mockCompetencesService.findAll.mockResolvedValue(result);

    const response = await controller.findAll({});

    expect(response).toEqual(result);
    expect(service.findAll).toHaveBeenCalledWith({});
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('GET /api/competences?limit=3&offset=0 - should apply pagination', async () => {
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

    mockCompetencesService.findAll.mockResolvedValue(result);

    const response = await controller.findAll(filter);

    expect(response).toEqual(result);
    expect(service.findAll).toHaveBeenCalledWith(filter);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('GET /api/competences?categorie=Backend - should filter by categorie', async () => {
    const filter = {
      categorie: 'Backend',
    };

    const result = [
      {
        id: '1',
        nom: 'NestJS',
        categorie: 'Backend',
        niveau: 'Avancé',
      },
    ];

    mockCompetencesService.findAll.mockResolvedValue(result);

    const response = await controller.findAll(filter);

    expect(response).toEqual(result);
    expect(service.findAll).toHaveBeenCalledWith(filter);
  });

  it('GET /api/competences?niveau=Avancé - should filter by niveau', async () => {
    const filter = {
      niveau: 'Avancé',
    };

    const result = [
      {
        id: '1',
        nom: 'NestJS',
        categorie: 'Backend',
        niveau: 'Avancé',
      },
    ];

    mockCompetencesService.findAll.mockResolvedValue(result);

    const response = await controller.findAll(filter);

    expect(response).toEqual(result);
    expect(service.findAll).toHaveBeenCalledWith(filter);
  });

  it('GET /api/competences?categorie=Backend&niveau=Avancé - should apply multiple filters', async () => {
    const filter = {
      categorie: 'Backend',
      niveau: 'Avancé',
    };

    const result = [
      {
        id: '1',
        nom: 'NestJS',
        categorie: 'Backend',
        niveau: 'Avancé',
      },
    ];

    mockCompetencesService.findAll.mockResolvedValue(result);

    const response = await controller.findAll(filter);

    expect(response).toEqual(result);
    expect(service.findAll).toHaveBeenCalledWith(filter);
  });

  it('GET /api/competences/:id - should return one competence', async () => {
    const id = '1';

    const result = {
      id: '1',
      nom: 'NestJS',
      description: 'Framework backend Node.js',
      categorie: 'Backend',
      niveau: 'Avancé',
    };

    mockCompetencesService.findOne.mockResolvedValue(result);

    const response = await controller.findOne(id);

    expect(response).toEqual(result);
    expect(service.findOne).toHaveBeenCalledWith(id);
    expect(service.findOne).toHaveBeenCalledTimes(1);
  });

  it('GET /api/competences/:id - should propagate service errors', async () => {
    const id = '999';

    const error = new Error(
      "Compétence avec l'id 999 introuvable",
    );

    mockCompetencesService.findOne.mockRejectedValue(error);

    await expect(controller.findOne(id)).rejects.toThrow(
      "Compétence avec l'id 999 introuvable",
    );

    expect(service.findOne).toHaveBeenCalledWith(id);
  });

  it('GET /api/competences - should propagate service errors', async () => {
    const error = new Error('Erreur lors de la récupération des compétences');

    mockCompetencesService.findAll.mockRejectedValue(error);

    await expect(controller.findAll({})).rejects.toThrow(
      'Erreur lors de la récupération des compétences',
    );
  });

  it('PUT /api/competences/:id - should update a competence', async () => {
    const id = '1';

    const updateData = {
      nom: 'C++',
      description: 'Langage de programmation',
      categorie: 'Programmation',
      niveau: 'Avancé',
    };

    const result = {
      id: '1',
      ...updateData,
    };

    mockCompetencesService.update.mockResolvedValue(result);

    const response = await controller.update(id, updateData);

    expect(response).toEqual(result);
    expect(service.update).toHaveBeenCalledWith(id, updateData);
    expect(service.update).toHaveBeenCalledTimes(1);
  });

  it('PUT /api/competences/:id - should propagate service errors', async () => {
    const id = '999';

    const updateData = {
      nom: 'C++',
      niveau: 'Avancé',
    };

    const error = new Error(
      "Compétence avec l'id 999 introuvable",
    );

    mockCompetencesService.update.mockRejectedValue(error);

    await expect(
      controller.update(id, updateData),
    ).rejects.toThrow(
      "Compétence avec l'id 999 introuvable",
    );

    expect(service.update).toHaveBeenCalledWith(id, updateData);
  });

  it('DELETE /api/competences/:id - should delete a competence', async () => {
    const id = '1';

    mockCompetencesService.remove.mockResolvedValue(undefined);

    const response = await controller.remove(id);

    expect(response).toEqual({
      message: 'Compétence supprimée avec succès',
    });

    expect(service.remove).toHaveBeenCalledWith(id);
    expect(service.remove).toHaveBeenCalledTimes(1);
  });

  it('DELETE /api/competences/:id - should propagate service errors', async () => {
    const id = '999';

    const error = new Error(
      "Compétence avec l'id 999 introuvable",
    );

    mockCompetencesService.remove.mockRejectedValue(error);

    await expect(
      controller.remove(id),
    ).rejects.toThrow(
      "Compétence avec l'id 999 introuvable",
    );

    expect(service.remove).toHaveBeenCalledWith(id);
  });

  it('GET /api/competences/search/similar - should return similar competences', async () => {
    const query = 'Docker';

    const result = [
      {
        id: '1',
        nom: 'Docker',
        description: 'Conteneurs',
        categorie: 'DevOps',
        niveau: 'Intermédiaire',
        similarity: 0.8088,
      },
    ];

    mockCompetencesService.searchSimilar.mockResolvedValue(result);

    const response = await controller.searchSimilar(query);

    expect(response).toEqual(result);
    expect(service.searchSimilar).toHaveBeenCalledWith(query);
    expect(service.searchSimilar).toHaveBeenCalledTimes(1);
  });

  it('GET /api/competences/search/similar - should propagate service errors', async () => {
    const query = 'Docker';

    const error = new Error(
      'Erreur lors de la recherche par similarité',
    );

    mockCompetencesService.searchSimilar.mockRejectedValue(error);

    await expect(controller.searchSimilar(query)).rejects.toThrow(
      'Erreur lors de la recherche par similarité',
    );

    expect(service.searchSimilar).toHaveBeenCalledWith(query);
  });
});