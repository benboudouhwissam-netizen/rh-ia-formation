import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from './entities/contract.entity';
import { Diploma } from './entities/diploma.entity';
import { Document } from './entities/document.entity';
import { Lot3Controller } from './lot3.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Contract, Diploma, Document])],
  controllers: [Lot3Controller],
})
export class Lot3Module {}
