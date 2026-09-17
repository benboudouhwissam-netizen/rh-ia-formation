import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Formation } from './entities/formation.entity';
import { TrainingSession } from './entities/training-session.entity';
import { Enrollment } from './entities/enrollment.entity';
import { Quiz } from './entities/quiz.entity';
import { QuizQuestion } from './entities/quiz-question.entity';
import { QuizAnswer } from './entities/quiz-answer.entity';
import { QuizResult } from './entities/quiz-result.entity';
import { LinkCertificationFormation } from './entities/link-certifications-formation.entity';
import { LearningTask } from './entities/learning-task.entity';
import { PerformanceEvent } from './entities/performance-event.entity';

import { FormationsService } from './formations.service';
import { FormationsController } from './formations.controller';

import { TrainingSessionsService } from './training-sessions/training-sessions.service';
import { EnrollmentsService } from './enrollments/enrollments.service';
import { EnrollmentsController } from './enrollments/enrollments.controller';
import { QuizService } from './quiz/quiz.service';
import { QuizController } from './quiz/quiz.controller';
import { QuizQuestionsService } from './quiz-questions/quiz-questions.service';
import { QuizQuestionsController } from './quiz-questions/quiz-questions.controller';
import { QuizAnswersService } from './quiz-answers/quiz-answers.service';
import { QuizAnswersController } from './quiz-answers/quiz-answers.controller';
import { QuizResultsService } from './quiz-results/quiz-results.service';
import { QuizResultsController } from './quiz-results/quiz-results.controller';
import { TrainingSessionsController } from './training-sessions/training-sessions.controller';
import { QuizAttemptsService } from './quiz-attempts/quiz-attempts.service';
import { QuizAttemptsController } from './quiz-attempts/quiz-attempts.controller';
import { LearningTasksController } from './learning-tasks/learning-tasks.controller';
import { LearningTasksService } from './learning-tasks/learning-tasks.service';
import { PerformanceEventsService } from './performance-events/performance-events.service';
import { PerformanceEventsController } from './performance-events/performance-events.controller';

import { Competence } from '../competences/entities/competence.entity';
import { FormationCompetence } from './entities/formation-competence.entity';
import { EmployeeCompetence } from '../competences/entities/employee-competence.entity';
import { Certification } from '../competences/entities/certification.entity';

import { AiModule } from '../ai/ai.module';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Formation,
      TrainingSession,
      Enrollment,
      Quiz,
      QuizQuestion,
      QuizAnswer,
      QuizResult,
      LinkCertificationFormation,
      LearningTask,
      PerformanceEvent,
      Competence,
      FormationCompetence,
      EmployeeCompetence,
      Certification,
    ]),
    AiModule,
  ],

  controllers: [
    FormationsController,
    EnrollmentsController,
    QuizController,
    QuizQuestionsController,
    QuizAnswersController,
    QuizResultsController,
    TrainingSessionsController,
    QuizAttemptsController,
    LearningTasksController,
    PerformanceEventsController,
  ],

  providers: [
    FormationsService,
    TrainingSessionsService,
    EnrollmentsService,
    QuizService,
    QuizQuestionsService,
    QuizAnswersService,
    QuizResultsService,
    QuizAttemptsService,
    LearningTasksService,
    PerformanceEventsService,
    SessionAuthGuard,
  ],

  exports: [
    FormationsService,
    TrainingSessionsService,
    EnrollmentsService,
    QuizService,
    QuizQuestionsService,
    QuizAnswersService,
    QuizResultsService,
    PerformanceEventsService,
  ],
})
export class FormationsModule {}
