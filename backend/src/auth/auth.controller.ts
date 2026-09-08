import { Body, Controller, Get, Headers, Post, Put, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginEmployeeDto } from './dto/login-employee.dto';
import { RegisterEmployeeDto } from './dto/register-employee.dto';
import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('authentification')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register') @ApiOperation({ summary: 'Créer un compte collaborateur' }) @ApiResponse({ status: 201, description: 'Compte et session créés.' }) register(@Body() dto: RegisterEmployeeDto) { return this.authService.register(dto); }
  @Post('login') @ApiOperation({ summary: 'Se connecter et obtenir une session' }) @ApiResponse({ status: 201, description: 'Session ouverte.' }) @ApiResponse({ status: 401, description: 'Identifiants invalides.' }) login(@Body() dto: LoginEmployeeDto) { return this.authService.login(dto); }
  @Get('me') @ApiTags('profil') @ApiBearerAuth('bearerAuth') @ApiOperation({ summary: 'Consulter le profil connecté' }) @ApiResponse({ status: 401, description: 'Session absente ou expirée.' }) me(@Headers('authorization') authorization?: string) { return this.authService.me(this.token(authorization)); }
  @Put('me') @ApiTags('profil') @ApiBearerAuth('bearerAuth') @ApiOperation({ summary: 'Mettre à jour le profil connecté' }) updateProfile(@Headers('authorization') authorization: string | undefined, @Body() dto: UpdateEmployeeProfileDto) { return this.authService.updateProfile(this.token(authorization), dto); }
  @Post('logout') @ApiBearerAuth('bearerAuth') @ApiOperation({ summary: 'Fermer la session connectée' }) async logout(@Headers('authorization') authorization?: string) {
    await this.authService.logout(this.token(authorization));
    return { success: true };
  }

  private token(authorization?: string) {
    const token = authorization?.replace(/^Bearer\s+/i, '');
    if (!token) throw new UnauthorizedException('Authentification requise.');
    return token;
  }
}
