import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { QuizAttemptsService } from './quiz-attempts.service';
import { SubmitQuizAttemptDto } from './dto/submit-quiz-attempt.dto';
@ApiTags('quiz') @Controller('quiz-attempts')
export class QuizAttemptsController {
  constructor(private readonly quizAttemptsService: QuizAttemptsService) {}
  @Post() @ApiOperation({ summary: 'Soumettre une tentative de quiz et calculer le résultat' }) @ApiResponse({ status: 201, description: 'Résultat créé, compétences et certificat mis à jour si le quiz est validé.' })
  submit(@Body() dto: SubmitQuizAttemptDto) { return this.quizAttemptsService.submit(dto); }
}
