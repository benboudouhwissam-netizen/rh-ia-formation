import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompetencesController } from './competences.controller';
import { CompetencesService } from './competences.service';

import { EmployeeCompetencesController } from './employee-competences.controller';
import { EmployeeCompetencesService } from './employee-competences.service';

import { CompetenceMatricesController } from './competence-matrices.controller';
import { CompetenceMatricesService } from './competence-matrices.service';

import { CertificationsController } from './certifications/certifications.controller';
import { CertificationsService } from './certifications/certifications.service';

import { Competence } from './entities/competence.entity';
import { EmployeeCompetence } from './entities/employee-competence.entity';
import { CompetenceMatrice } from './entities/competence-matrice.entity';
import { Certification } from './entities/certification.entity';
import { CompetenceGapService } from './competence-gap.service';
import { CompetenceGapController } from './competence-gap.controller';

import { FormationsModule } from '../formations/formations.module';
import { Formation } from '../formations/entities/formation.entity';
import { LinkCertificationFormation } from '../formations/entities/link-certifications-formation.entity';
import { Quiz } from '../formations/entities/quiz.entity';
import { QuizResult } from '../formations/entities/quiz-result.entity';
import { FormationCompetence } from '../formations/entities/formation-competence.entity';

import { AiModule } from '../ai/ai.module';
import { StorageModule } from '../storage/storage.module';
import { EmployeeAccount } from '../auth/entities/employee-account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Competence,
      EmployeeCompetence,
      CompetenceMatrice,
      Certification,
      Formation,
      LinkCertificationFormation,
      Quiz,
      QuizResult,
      FormationCompetence,
      EmployeeAccount,
    ]),
    AiModule,
    FormationsModule,
    StorageModule,
  ],
  controllers: [
    CompetencesController,
    EmployeeCompetencesController,
    CompetenceMatricesController,
    CompetenceGapController,
    CertificationsController,
  ],
  providers: [
    CompetencesService,
    EmployeeCompetencesService,
    CompetenceMatricesService,
    CompetenceGapService,
    CertificationsService,
  ],
})
export class CompetencesModule {}
