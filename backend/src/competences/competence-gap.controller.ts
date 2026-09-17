import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CompetenceGapService } from './competence-gap.service';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';

@ApiTags('recommandations')
@Controller('competences')
@UseGuards(SessionAuthGuard)
export class CompetenceGapController {
  constructor(private readonly competenceGapService: CompetenceGapService) {}

  @Get('gaps/:utilisateurId')
  @ApiOperation({ summary: 'Détecter les écarts de compétences pour un poste' })
  @ApiParam({ name: 'utilisateurId', description: 'UUID du collaborateur' })
  @ApiQuery({
    name: 'posteId',
    description: 'UUID du poste cible',
    required: true,
  })
  getCompetenceGaps(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @Query('posteId', new ParseUUIDPipe()) posteId: string,
  ) {
    return this.competenceGapService.getCompetenceGaps(utilisateurId, posteId);
  }

  @Get('recommendations/:utilisateurId')
  @ApiOperation({
    summary: 'Obtenir les formations recommandées selon les écarts',
  })
  @ApiParam({ name: 'utilisateurId', description: 'UUID du collaborateur' })
  @ApiQuery({
    name: 'posteId',
    description: 'UUID du poste cible',
    required: true,
  })
  getRecommendations(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @Query('posteId', new ParseUUIDPipe()) posteId: string,
  ) {
    return this.competenceGapService.getTopRecommendedFormations(
      utilisateurId,
      posteId,
    );
  }
}
