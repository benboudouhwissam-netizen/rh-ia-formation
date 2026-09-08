import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmployeeAccount } from './entities/employee-account.entity';
import { EmployeeAuthSession } from './entities/employee-auth-session.entity';
import { FormationsModule } from '../formations/formations.module';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeAccount, EmployeeAuthSession]), FormationsModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
