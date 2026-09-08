import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FormationsService } from './formations.service';
import { CreateFormationDto } from './dto/create-formation.dto';
import { UpdateFormationDto } from './dto/update-formation.dto';
import { FilterFormationDto } from './dto/filter-formation.dto';

@ApiTags('formations')
@Controller('formations')
export class FormationsController {
  constructor(private readonly formationsService: FormationsService) {}
  @Get() @ApiOperation({ summary: 'Lister le catalogue de formations' })
  findAll(@Query() filterDto: FilterFormationDto) { return this.formationsService.findAll(filterDto); }
  @Get('search') @ApiOperation({ summary: 'Rechercher des formations dans le catalogue' })
  search(@Query() filterDto: FilterFormationDto) { return this.formationsService.findAll(filterDto); }
  @Get('similar/:competenceId') @ApiOperation({ summary: 'Trouver les formations similaires à une compétence' }) @ApiParam({ name: 'competenceId', description: 'UUID de la compétence' })
  searchSimilarFormations(@Param('competenceId') competenceId: string) { return this.formationsService.searchSimilarFormations(competenceId); }
  @Get(':id/embedding') @ApiOperation({ summary: 'Générer l embedding IA d une formation' }) @ApiParam({ name: 'id', description: 'UUID de la formation' })
  generateEmbedding(@Param('id') id: string) { return this.formationsService.generateEmbedding(id); }
  @Get(':id') @ApiOperation({ summary: 'Consulter le détail d une formation' }) @ApiParam({ name: 'id', description: 'UUID de la formation' })
  findOne(@Param('id') id: string) { return this.formationsService.findOne(id); }
  @Post(':id/competences/:competenceId') @ApiOperation({ summary: 'Lier une compétence cible à une formation' }) @ApiParam({ name: 'id', description: 'UUID de la formation' }) @ApiParam({ name: 'competenceId', description: 'UUID de la compétence' }) @ApiQuery({ name: 'niveauVise', required: false, example: 3 })
  lierCompetence(@Param('id') id: string, @Param('competenceId') competenceId: string, @Body('niveauVise') niveauVise?: number) { return this.formationsService.lierCompetence(id, competenceId, niveauVise); }
  @Post() @ApiOperation({ summary: 'Créer une formation' })
  create(@Body() createFormationDto: CreateFormationDto) { return this.formationsService.create(createFormationDto); }
  @Post('embeddings/generate-missing') @ApiOperation({ summary: 'Générer les embeddings manquants du catalogue' })
  generateMissingEmbeddings() { return this.formationsService.generateMissingEmbeddings(); }
  @Put(':id') @ApiOperation({ summary: 'Mettre à jour une formation' }) @ApiParam({ name: 'id', description: 'UUID de la formation' })
  update(@Param('id') id: string, @Body() updateFormationDto: UpdateFormationDto) { return this.formationsService.update(id, updateFormationDto); }
  @Delete(':id') @ApiOperation({ summary: 'Supprimer une formation' }) @ApiParam({ name: 'id', description: 'UUID de la formation' })
  remove(@Param('id') id: string) { return this.formationsService.remove(id); }
}
