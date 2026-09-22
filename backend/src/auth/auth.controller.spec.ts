import { AuthController } from './auth.controller';
describe('AuthController', () => {
  const service: any = { register: jest.fn(), login: jest.fn(), me: jest.fn(), updateProfile: jest.fn(), logout: jest.fn() };
  let controller: AuthController;
  beforeEach(() => { jest.clearAllMocks(); controller = new AuthController(service); });
  it('délègue register et login', async () => { service.register.mockResolvedValue('r'); service.login.mockResolvedValue('l'); expect(await controller.register({} as any)).toBe('r'); expect(await controller.login({} as any)).toBe('l'); });
  it('délègue les routes protégées avec le token nettoyé', async () => { service.me.mockResolvedValue('m'); service.updateProfile.mockResolvedValue('u'); service.logout.mockResolvedValue(undefined); expect(await controller.me('Bearer tok')).toBe('m'); expect(await controller.updateProfile('bearer tok', {} as any)).toBe('u'); expect(await controller.logout('Bearer tok')).toEqual({ success: true }); expect(service.me).toHaveBeenCalledWith('tok'); });
  it('refuse un header absent', () => { expect(() => controller.me()).toThrow('Authentification requise.'); });
});
