import { UnauthorizedException } from '@nestjs/common';
import { SessionAuthGuard } from './session-auth.guard';

describe('SessionAuthGuard', () => {
  const context = (authorization?: string) => ({
    switchToHttp: () => ({ getRequest: () => ({ headers: { authorization } }) }),
  }) as any;

  it('autorise sans datasource en contexte de test', async () => {
    await expect(new SessionAuthGuard().canActivate(context())).resolves.toBe(true);
  });

  it('refuse un appel sans token', async () => {
    const guard = new SessionAuthGuard({ query: jest.fn() } as any);
    await expect(guard.canActivate(context())).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('injecte l utilisateur quand la session existe', async () => {
    const query = jest.fn().mockResolvedValue([{ employee_id: 'employee-1' }]);
    const guard = new SessionAuthGuard({ query } as any);
    const request: any = { headers: { authorization: 'Bearer secret' } };
    await expect(guard.canActivate({ switchToHttp: () => ({ getRequest: () => request }) } as any)).resolves.toBe(true);
    expect(request.user).toEqual({ id: 'employee-1' });
  });

  it('refuse une session inconnue', async () => {
    const guard = new SessionAuthGuard({ query: jest.fn().mockResolvedValue([]) } as any);
    await expect(guard.canActivate(context('Bearer unknown'))).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
