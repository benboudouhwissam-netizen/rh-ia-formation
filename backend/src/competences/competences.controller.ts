import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CompetencesService } from './competences.service';
import { CreateCompetenceDto } from './dto/create-competence.dto';
import { UpdateCompetenceDto } from './dto/update-competence.dto';
import { FilterCompetenceDto } from './dto/filter-competence.dto';

@ApiTags('competences')
@Controller('competences')
export class CompetencesController {
  constructor(private readonly competencesService: CompetencesService) {}
  @Get() @ApiOperation({ summary: 'Lister les compétences avec filtres' })
  findAll(@Query() filterDto: FilterCompetenceDto) { return this.competencesService.findAll(filterDto); }
  @Get('ping') @ApiOperation({ summary: 'Vérifier la disponibilité du module Compétences' })
  ping() { return { ok: true }; }
  @Get('search/similar') @ApiOperation({ summary: 'Rechercher des compétences similaires avec IA' }) @ApiQuery({ name: 'query', required: true, example: 'Docker' })
  searchSimilar(@Query('query') query: string) { return this.competencesService.searchSimilar(query); }
  @Post('generate-missing-embeddings') @ApiOperation({ summary: 'Générer les embeddings manquants des compétences' })
  generateMissingEmbeddings() { return this.competencesService.generateMissingEmbeddings(); }
  @Get(':id') @ApiOperation({ summary: 'Consulter une compétence' }) @ApiParam({ name: 'id', description: 'UUID de la compétence' })
  findOne(@Param('id') id: string) { return this.competencesService.findOne(id); }
  @Post() @ApiOperation({ summary: 'Créer une compétence' })
  create(@Body() createDto: CreateCompetenceDto) { return this.competencesService.create(createDto); }
  @Put(':id') @ApiOperation({ summary: 'Mettre à jour une compétence' }) @ApiParam({ name: 'id', description: 'UUID de la compétence' })
  update(@Param('id') id: string, @Body() updateDto: UpdateCompetenceDto) { return this.competencesService.update(id, updateDto); }
  @Delete(':id') @ApiOperation({ summary: 'Supprimer une compétence' }) @ApiParam({ name: 'id', description: 'UUID de la compétence' })
  async remove(@Param('id') id: string) { await this.competencesService.remove(id); return { message: 'Compétence supprimée avec succès' }; }
}
