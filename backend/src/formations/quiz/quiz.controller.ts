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
import { QuizService } from './quiz.service';
import { CreateQuizDto } from '../dto/create-quiz.dto';
import { UpdateQuizDto } from '../dto/update-quiz.dto';
import { FilterQuizDto } from '../dto/filter-quiz.dto';
@ApiTags('quiz')
@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}
  @Get() @ApiOperation({ summary: 'Lister les quiz avec filtres' }) findAll(
    @Query() filterDto: FilterQuizDto,
  ) {
    return this.quizService.findAll(filterDto);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Consulter un quiz' })
  @ApiParam({ name: 'id', description: 'UUID du quiz' })
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(id);
  }
  @Post() @ApiOperation({ summary: 'Créer un quiz pour une formation' }) create(
    @Body() createDto: CreateQuizDto,
  ) {
    return this.quizService.create(createDto);
  }
  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un quiz' })
  @ApiParam({ name: 'id', description: 'UUID du quiz' })
  update(@Param('id') id: string, @Body() updateDto: UpdateQuizDto) {
    return this.quizService.update(id, updateDto);
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un quiz' })
  @ApiParam({ name: 'id', description: 'UUID du quiz' })
  remove(@Param('id') id: string) {
    return this.quizService.remove(id);
  }
}
