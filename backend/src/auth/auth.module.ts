import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmployeeAccount } from './entities/employee-account.entity';
import { EmployeeAuthSession } from './entities/employee-auth-session.entity';
import { FormationsModule } from '../formations/formations.module';
import { Contract } from '../lot3/entities/contract.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeeAccount, EmployeeAuthSession, Contract]),
    FormationsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
