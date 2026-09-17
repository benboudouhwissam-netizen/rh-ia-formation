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
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { QuizQuestionsService } from './quiz-questions.service';
import { CreateQuizQuestionDto } from '../dto/create-quiz-question.dto';
import { UpdateQuizQuestionDto } from '../dto/update-quiz-question.dto';
import { FilterQuizQuestionDto } from '../dto/filter-quiz-question.dto';
@ApiTags('quiz')
@Controller('quiz-questions')
export class QuizQuestionsController {
  constructor(private readonly quizQuestionsService: QuizQuestionsService) {}
  @Get()
  @ApiOperation({ summary: 'Lister les questions de quiz avec filtres' })
  findAll(@Query() filterDto: FilterQuizQuestionDto) {
    return this.quizQuestionsService.findAll(filterDto);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Consulter une question de quiz' })
  @ApiParam({ name: 'id', description: 'UUID de la question' })
  findOne(@Param('id') id: string) {
    return this.quizQuestionsService.findOne(id);
  }
  @Post() @ApiOperation({ summary: 'Créer une question de quiz' }) create(
    @Body() createDto: CreateQuizQuestionDto,
  ) {
    return this.quizQuestionsService.create(createDto);
  }
  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une question de quiz' })
  @ApiParam({ name: 'id', description: 'UUID de la question' })
  update(@Param('id') id: string, @Body() updateDto: UpdateQuizQuestionDto) {
    return this.quizQuestionsService.update(id, updateDto);
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une question de quiz' })
  @ApiParam({ name: 'id', description: 'UUID de la question' })
  remove(@Param('id') id: string) {
    return this.quizQuestionsService.remove(id);
  }
}
