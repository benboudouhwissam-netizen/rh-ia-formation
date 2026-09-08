import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { TrainingSessionsService } from './training-sessions.service';
import { CreateTrainingSessionDto } from '../dto/create-training-session.dto';
import { UpdateTrainingSessionDto } from '../dto/update-training-session.dto';
import { FilterTrainingSessionDto } from '../dto/filter-training-session.dto';
@ApiTags('sessions') @Controller('training-sessions')
export class TrainingSessionsController {
  constructor(private readonly trainingSessionsService: TrainingSessionsService) {}
  @Get() @ApiOperation({ summary: 'Lister les sessions de formation' }) findAll(@Query() filterDto: FilterTrainingSessionDto) { return this.trainingSessionsService.findAll(filterDto); }
  @Get(':id') @ApiOperation({ summary: 'Consulter une session de formation' }) @ApiParam({ name: 'id', description: 'UUID de la session' }) findOne(@Param('id') id: string) { return this.trainingSessionsService.findOne(id); }
  @Post() @ApiOperation({ summary: 'Créer une session de formation' }) create(@Body() createDto: CreateTrainingSessionDto) { return this.trainingSessionsService.create(createDto); }
  @Put(':id') @ApiOperation({ summary: 'Mettre à jour une session de formation' }) @ApiParam({ name: 'id', description: 'UUID de la session' }) update(@Param('id') id: string, @Body() updateDto: UpdateTrainingSessionDto) { return this.trainingSessionsService.update(id, updateDto); }
  @Delete(':id') @ApiOperation({ summary: 'Supprimer une session de formation' }) @ApiParam({ name: 'id', description: 'UUID de la session' }) remove(@Param('id') id: string) { return this.trainingSessionsService.remove(id); }
}
