import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const employees: any = {
    findOne: jest.fn(),
    create: jest.fn((value) => value),
    save: jest.fn((value) => Promise.resolve({ id: 'employee-1', ...value })),
    createQueryBuilder: jest.fn(),
  };
  const sessions: any = {
    findOne: jest.fn(),
    create: jest.fn((value) => value),
    save: jest.fn((value) => Promise.resolve(value)),
    delete: jest.fn(),
  };
  const contracts: any = { create: jest.fn((value) => value), save: jest.fn() };
  const performance = { publish: jest.fn() };
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(employees, sessions, contracts, performance as any);
  });

  it('inscrit un salarié et crée son contrat et sa session', async () => {
    const result = await service.register({
      nom_complet: '  Test User ', email_professionnel: ' TEST@MAIL.COM ',
      mot_de_passe: 'MotDePasse123!', poste_id: 'poste-1', type_contrat: 'CDI',
    } as any);
    expect(result.token).toHaveLength(64);
    expect(contracts.save).toHaveBeenCalled();
    expect(sessions.save).toHaveBeenCalled();
    expect(result.employee.email_professionnel).toBe('test@mail.com');
  });

  it('refuse une adresse déjà utilisée', async () => {
    employees.findOne.mockResolvedValue({ id: 'existing' });
    await expect(service.register({ email_professionnel: 'x@y.ma' } as any))
      .rejects.toBeInstanceOf(ConflictException);
  });

  it('valide une session active et refuse une session expirée', async () => {
    const employee = { id: 'employee-1', nom_complet: 'Test', email_professionnel: 'x@y.ma', poste_id: 'p' };
    sessions.findOne.mockResolvedValue({ employee, expires_at: new Date(Date.now() + 60_000) });
    expect((await service.me('token')).id).toBe(employee.id);
    sessions.findOne.mockResolvedValue({ employee, expires_at: new Date(Date.now() - 60_000) });
    await expect(service.me('token')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refuse une connexion avec un mot de passe incorrect', async () => {
    const qb = { addSelect: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), getOne: jest.fn().mockResolvedValue(null) };
    employees.createQueryBuilder.mockReturnValue(qb);
    await expect(service.login({ email_professionnel: 'x@y.ma', mot_de_passe: 'bad' } as any))
      .rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('met à jour le profil et publie un événement', async () => {
    const employee = { id: 'employee-1', nom_complet: 'Ancien', email_professionnel: 'old@y.ma', poste_id: 'p' };
    sessions.findOne.mockResolvedValue({ employee, expires_at: new Date(Date.now() + 60_000) });
    employees.findOne.mockResolvedValue(null);
    const result = await service.updateProfile('token', { nom_complet: ' Nouveau ', city: 'Rabat' } as any);
    expect(result.nom_complet).toBe('Nouveau');
    expect(performance.publish).toHaveBeenCalledWith(expect.objectContaining({ type: 'profil_modifie' }));
  });

  it('déconnecte une session', async () => {
    await service.logout('token');
    expect(sessions.delete).toHaveBeenCalled();
  });
});
