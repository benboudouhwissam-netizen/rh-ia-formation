import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { QuizAnswersService } from './quiz-answers.service';
import { CreateQuizAnswerDto } from '../dto/create-quiz-answer.dto';
import { UpdateQuizAnswerDto } from '../dto/update-quiz-answer.dto';
import { FilterQuizAnswerDto } from '../dto/filter-quiz-answer.dto';

import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('quiz')
@Controller('quiz-answers')
export class QuizAnswersController {
  constructor(private readonly quizAnswersService: QuizAnswersService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les réponses de quiz (avec filtres)' })
  @ApiResponse({
    status: 200,
    description: 'Liste des réponses correspondant aux filtres',
  })
  findAll(@Query() filterDto: FilterQuizAnswerDto) {
    return this.quizAnswersService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'une réponse de quiz" })
  @ApiParam({ name: 'id', description: 'UUID de la réponse' })
  @ApiResponse({ status: 200, description: 'Réponse trouvée' })
  @ApiResponse({ status: 404, description: 'Réponse introuvable' })
  findOne(@Param('id') id: string) {
    return this.quizAnswersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une réponse pour une question de quiz' })
  @ApiResponse({ status: 201, description: 'Réponse créée avec succès' })
  create(@Body() createDto: CreateQuizAnswerDto) {
    return this.quizAnswersService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une réponse de quiz' })
  @ApiParam({ name: 'id', description: 'UUID de la réponse' })
  update(@Param('id') id: string, @Body() updateDto: UpdateQuizAnswerDto) {
    return this.quizAnswersService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une réponse de quiz' })
  @ApiParam({ name: 'id', description: 'UUID de la réponse' })
  remove(@Param('id') id: string) {
    return this.quizAnswersService.remove(id);
  }
}
