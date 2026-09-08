import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { QuizResultsService } from './quiz-results.service';
import { CreateQuizResultDto } from '../dto/create-quiz-result.dto';
import { UpdateQuizResultDto } from '../dto/update-quiz-result.dto';
import { FilterQuizResultDto } from '../dto/filter-quiz-result.dto';
@ApiTags('quiz') @Controller('quiz-results')
export class QuizResultsController {
  constructor(private readonly quizResultsService: QuizResultsService) {}
  @Get() @ApiOperation({ summary: 'Lister les résultats de quiz avec filtres' }) findAll(@Query() filters: FilterQuizResultDto) { return this.quizResultsService.findAll(filters); }
  @Get(':id') @ApiOperation({ summary: 'Consulter un résultat de quiz' }) @ApiParam({ name: 'id', description: 'UUID du résultat' }) findOne(@Param('id') id: string) { return this.quizResultsService.findOne(id); }
  @Post() @ApiOperation({ summary: 'Créer un résultat de quiz' }) create(@Body() createDto: CreateQuizResultDto) { return this.quizResultsService.create(createDto); }
  @Put(':id') @ApiOperation({ summary: 'Mettre à jour un résultat de quiz' }) @ApiParam({ name: 'id', description: 'UUID du résultat' }) update(@Param('id') id: string, @Body() updateDto: UpdateQuizResultDto) { return this.quizResultsService.update(id, updateDto); }
  @Delete(':id') @ApiOperation({ summary: 'Supprimer un résultat de quiz' }) @ApiParam({ name: 'id', description: 'UUID du résultat' }) remove(@Param('id') id: string) { return this.quizResultsService.remove(id); }
}
