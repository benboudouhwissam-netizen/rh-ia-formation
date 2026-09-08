import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CompetenceMatricesService } from './competence-matrices.service';

@ApiTags('matrices de competences')
@Controller('competence-matrices')
export class CompetenceMatricesController {
  constructor(private readonly competenceMatricesService: CompetenceMatricesService) {}
  @Get('poste/:posteId') @ApiOperation({ summary: 'Lister les niveaux requis pour un poste' }) @ApiParam({ name: 'posteId', description: 'UUID du poste' })
  findByPoste(@Param('posteId') posteId: string) { return this.competenceMatricesService.findByPoste(posteId); }
  @Get('detail/:id') @ApiOperation({ summary: 'Consulter une règle de matrice de compétences' }) @ApiParam({ name: 'id', description: 'UUID de la règle' })
  findOne(@Param('id') id: string) { return this.competenceMatricesService.findOne(id); }
  @Get('postes/liste') @ApiOperation({ summary: 'Lister les postes configurés dans la matrice' })
  listPostes() { return this.competenceMatricesService.listPostesDistincts(); }
  @Get('ecarts/:posteId') @ApiOperation({ summary: 'Comparer niveau observé et niveau requis par compétence' }) @ApiParam({ name: 'posteId', description: 'UUID du poste' })
  getEcartsParPoste(@Param('posteId') posteId: string) { return this.competenceMatricesService.getEcartsParPoste(posteId); }
}
