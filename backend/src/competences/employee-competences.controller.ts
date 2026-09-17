import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EmployeeCompetencesService } from './employee-competences.service';
import { CreateEmployeeCompetenceDto } from './dto/create-employee-competence.dto';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';

@ApiTags('competences')
@Controller('employee-competences')
@UseGuards(SessionAuthGuard)
export class EmployeeCompetencesController {
  constructor(
    private readonly employeeCompetencesService: EmployeeCompetencesService,
  ) {}
  @Get('detail/:id')
  @ApiOperation({ summary: 'Consulter une évaluation de compétence' })
  @ApiParam({ name: 'id', description: 'UUID de l évaluation' })
  findOne(@Param('id') id: string) {
    return this.employeeCompetencesService.findOne(id);
  }
  @Post()
  @ApiOperation({
    summary: 'Créer ou mettre à jour une compétence collaborateur',
  })
  createOrUpdate(@Body() createDto: CreateEmployeeCompetenceDto) {
    return this.employeeCompetencesService.createOrUpdate(createDto);
  }
  @Get('matrix/all')
  @ApiOperation({
    summary: 'Obtenir la matrice de compétences de tous les collaborateurs',
  })
  getMatrix() {
    return this.employeeCompetencesService.getMatrix();
  }
  @Get('experts/top')
  @ApiOperation({ summary: 'Identifier les experts internes par compétence' })
  @ApiQuery({ name: 'limit', required: false, example: 5 })
  getTopExperts(@Query('limit') limit?: string) {
    return this.employeeCompetencesService.getTopExperts(
      limit ? Number(limit) : 5,
    );
  }
  @Get(':utilisateurId')
  @ApiOperation({ summary: 'Lister les compétences d un collaborateur' })
  @ApiParam({ name: 'utilisateurId', description: 'UUID du collaborateur' })
  findByUtilisateur(@Param('utilisateurId') utilisateurId: string) {
    return this.employeeCompetencesService.findByUtilisateur(utilisateurId);
  }
  @Delete('detail/:id')
  @ApiOperation({ summary: 'Supprimer une évaluation de compétence' })
  @ApiParam({ name: 'id', description: 'UUID de l évaluation' })
  remove(@Param('id') id: string) {
    return this.employeeCompetencesService.remove(id);
  }
}
