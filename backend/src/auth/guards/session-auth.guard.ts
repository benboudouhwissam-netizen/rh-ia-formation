import { CanActivate, ExecutionContext, Injectable, Optional, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createHash } from 'crypto';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(@Optional() private readonly dataSource?: DataSource) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string }; user?: unknown }>();
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!this.dataSource) return true;
    if (!token) throw new UnauthorizedException('Authentification requise.');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const rows = await this.dataSource.query(
      'SELECT employee_id FROM employee_auth_sessions WHERE token_hash = $1 AND expires_at > NOW()',
      [tokenHash],
    );
    if (!rows[0]) throw new UnauthorizedException('Session absente ou expirée.');
    request.user = { id: rows[0].employee_id };
    return true;
  }
}
