import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3001')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({ origin: allowedOrigins, credentials: true });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('RH IA — Lot 8 : Formation & Gestion des compétences')
    .setDescription(
      "Documentation de l'API du Module Formation IA et Gestion des compétences. " +
        'Couvre le catalogue de formations, les quiz, les compétences, la cartographie ' +
        'et le moteur de recommandation IA basé sur pgvector.',
    )
    .setVersion('1.0')
    .addTag('formations', 'Catalogue, sessions, inscriptions')
    .addTag('sessions', 'Planification des sessions de formation')
    .addTag('inscriptions', 'Inscriptions des collaborateurs aux sessions')
    .addTag('quiz', 'Quiz, questions, réponses, tentatives et résultats')
    .addTag('competences', 'Compétences et évaluations des collaborateurs')
    .addTag('matrices de competences', 'Niveaux requis et écarts par poste')
    .addTag('recommandations', 'Détection des écarts et recommandations IA')
    .addTag('certifications', 'Certificats obtenus après validation des quiz')
    .addTag('authentification', 'Comptes, sessions et profil utilisateur')
    .addTag('profil', 'Informations du profil connecté')
    .addTag('notifications', 'Tâches et notifications d apprentissage')
    .addTag('performance', 'Événements transmis au module Performance')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Jeton de session obtenu avec /auth/login ou /auth/register',
      },
      'bearerAuth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION');
  console.error(err);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION');
  console.error(err);
});
