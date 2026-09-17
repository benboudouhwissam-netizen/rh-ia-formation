import { Controller, Get, Query } from '@nestjs/common';
import { LearningTasksService } from './learning-tasks.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('learning-tasks')
export class LearningTasksController {
  constructor(private readonly learningTasksService: LearningTasksService) {}

  @Get()
  @ApiOperation({
    summary: 'Lister les tâches et notifications d apprentissage',
  })
  @ApiQuery({
    name: 'utilisateur_id',
    description: 'UUID du collaborateur',
    required: true,
  })
  findForUser(@Query('utilisateur_id') utilisateurId: string) {
    return this.learningTasksService.findForUser(utilisateurId);
  }
}
