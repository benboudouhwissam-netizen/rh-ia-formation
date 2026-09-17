import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompetencesModule } from '../competences/competences.module';
import { AiModule } from '../ai/ai.module';
import { FormationsModule } from '../formations/formations.module';
import { AuthModule } from '../auth/auth.module';
import { Lot3Module } from '../lot3/lot3.module';
import { ChatbotModule } from '../chatbot/chatbot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({
        type: 'postgres',

        host: config.get('DB_HOST'),
        port: Number(config.get('DB_PORT')),

        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),

        autoLoadEntities: true,

        synchronize: false,
      }),
    }),

    CompetencesModule,
    FormationsModule,
    AuthModule,
    AiModule,
    Lot3Module,
    ChatbotModule,
  ],
})
export class AppModule {}
