import { Controller, Get, Query } from '@nestjs/common';
import { PerformanceEventsService } from './performance-events.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('performance')
@Controller('performance-events')
export class PerformanceEventsController {
  constructor(private readonly performanceEventsService: PerformanceEventsService) {}

  @Get() @ApiOperation({ summary: 'Lister les événements Performance d un collaborateur' }) @ApiQuery({ name: 'utilisateur_id', description: 'UUID du collaborateur', required: true })
  findForUser(@Query('utilisateur_id') utilisateurId: string) {
    return this.performanceEventsService.findForUser(utilisateurId);
  }
}
