import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { Repository } from 'typeorm';
import { LoginEmployeeDto } from './dto/login-employee.dto';
import { RegisterEmployeeDto } from './dto/register-employee.dto';
import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
import { EmployeeAccount } from './entities/employee-account.entity';
import { EmployeeAuthSession } from './entities/employee-auth-session.entity';
import { PerformanceEventsService } from '../formations/performance-events/performance-events.service';
import { Contract } from '../lot3/entities/contract.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(EmployeeAccount) private readonly employees: Repository<EmployeeAccount>,
    @InjectRepository(EmployeeAuthSession) private readonly sessions: Repository<EmployeeAuthSession>,
    @InjectRepository(Contract) private readonly contracts: Repository<Contract>,
    private readonly performanceEventsService: PerformanceEventsService,
  ) {}

  async register(dto: RegisterEmployeeDto) {
    const email = dto.email_professionnel.trim().toLowerCase();
    if (await this.employees.findOne({ where: { email_professionnel: email } })) {
      throw new ConflictException('Un compte existe déjà avec cet e-mail professionnel.');
    }
    const employee = await this.employees.save(this.employees.create({
      nom_complet: dto.nom_complet.trim(), email_professionnel: email,
      password_hash: this.hashPassword(dto.mot_de_passe), poste_id: dto.poste_id,
      type_contrat: dto.type_contrat ?? null,
    }));
    if (dto.type_contrat) {
      await this.contracts.save(this.contracts.create({
        employee_id: employee.id,
        type: dto.type_contrat,
        status: 'actif',
        start_date: new Date().toISOString().slice(0, 10),
      }));
    }
    return this.createSession(employee);
  }

  async login(dto: LoginEmployeeDto) {
    const employee = await this.employees
      .createQueryBuilder('employee')
      .addSelect('employee.password_hash')
      .where('employee.email_professionnel = :email', { email: dto.email_professionnel.trim().toLowerCase() })
      .getOne();
    if (!employee || !this.verifyPassword(dto.mot_de_passe, employee.password_hash)) {
      throw new UnauthorizedException('E-mail ou mot de passe incorrect.');
    }
    return this.createSession(employee);
  }

  async me(token: string) {
    const session = await this.sessions.findOne({
      where: { token_hash: this.hashToken(token) }, relations: { employee: true },
    });
    if (!session || session.expires_at < new Date()) throw new UnauthorizedException('Session expirée.');
    return this.publicProfile(session.employee);
  }

  async logout(token: string) {
    await this.sessions.delete({ token_hash: this.hashToken(token) });
  }

  async updateProfile(token: string, dto: UpdateEmployeeProfileDto) {
    const session = await this.sessions.findOne({
      where: { token_hash: this.hashToken(token) }, relations: { employee: true },
    });
    if (!session || session.expires_at < new Date()) throw new UnauthorizedException('Session expirée.');

    const employee = session.employee;
    if (dto.email_professionnel) {
      const email = dto.email_professionnel.trim().toLowerCase();
      const existing = await this.employees.findOne({ where: { email_professionnel: email } });
      if (existing && existing.id !== employee.id) throw new ConflictException('Un compte existe déjà avec cet e-mail professionnel.');
      employee.email_professionnel = email;
    }
    if (dto.nom_complet) employee.nom_complet = dto.nom_complet.trim();
    if (dto.poste_id) employee.poste_id = dto.poste_id;
    if (dto.type_contrat) employee.type_contrat = dto.type_contrat;
    if (dto.avatar_url !== undefined) employee.avatar_url = dto.avatar_url || null;
    for (const field of ['matricule', 'first_name', 'last_name', 'phone', 'birth_date', 'address', 'city', 'postal_code', 'country', 'hire_date', 'status', 'job_title'] as const) {
      if (dto[field] !== undefined) employee[field] = dto[field] || null;
    }

    const updatedEmployee = await this.employees.save(employee);
    await this.performanceEventsService.publish({
      utilisateur_id: updatedEmployee.id,
      type: 'profil_modifie',
      reference_id: null,
      payload: { champs: Object.keys(dto).filter((field) => field !== 'avatar_url') },
    });
    return this.publicProfile(updatedEmployee);
  }

  private async createSession(employee: EmployeeAccount) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    await this.sessions.save(this.sessions.create({ employee_id: employee.id, token_hash: this.hashToken(token), expires_at: expiresAt }));
    return { token, employee: this.publicProfile(employee), expires_at: expiresAt.toISOString() };
  }

  private publicProfile(employee: EmployeeAccount) {
    return {
      id: employee.id, nom_complet: employee.nom_complet, email_professionnel: employee.email_professionnel,
      poste_id: employee.poste_id, avatar_url: employee.avatar_url ?? null, type_contrat: employee.type_contrat ?? null,
      matricule: employee.matricule ?? null, first_name: employee.first_name ?? null, last_name: employee.last_name ?? null,
      phone: employee.phone ?? null, birth_date: employee.birth_date ?? null, address: employee.address ?? null,
      city: employee.city ?? null, postal_code: employee.postal_code ?? null, country: employee.country ?? null,
      hire_date: employee.hire_date ?? null, status: employee.status ?? null, job_title: employee.job_title ?? null,
    };
  }

  private hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
  }

  private verifyPassword(password: string, stored: string) {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const candidate = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, 'hex');
    return expected.length === candidate.length && timingSafeEqual(expected, candidate);
  }

  private hashToken(token: string) { return createHash('sha256').update(token).digest('hex'); }
}
