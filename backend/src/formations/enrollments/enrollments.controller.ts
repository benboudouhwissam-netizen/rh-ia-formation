import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from '../dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from '../dto/update-enrollment.dto';
import { FilterEnrollmentDto } from '../dto/filter-enrollment.dto';
@ApiTags('inscriptions') @Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}
  @Get() @ApiOperation({ summary: 'Lister les inscriptions avec filtres' }) findAll(@Query() filterDto: FilterEnrollmentDto) { return this.enrollmentsService.findAll(filterDto); }
  @Get(':id') @ApiOperation({ summary: 'Consulter une inscription' }) @ApiParam({ name: 'id', description: 'UUID de l inscription' }) findOne(@Param('id') id: string) { return this.enrollmentsService.findOne(id); }
  @Post() @ApiOperation({ summary: 'Inscrire un collaborateur à une session de formation' }) create(@Body() createDto: CreateEnrollmentDto) { return this.enrollmentsService.create(createDto); }
  @Put(':id') @ApiOperation({ summary: 'Mettre à jour le statut d une inscription' }) @ApiParam({ name: 'id', description: 'UUID de l inscription' }) update(@Param('id') id: string, @Body() updateDto: UpdateEnrollmentDto) { return this.enrollmentsService.update(id, updateDto); }
  @Delete(':id') @ApiOperation({ summary: 'Supprimer une inscription' }) @ApiParam({ name: 'id', description: 'UUID de l inscription' }) remove(@Param('id') id: string) { return this.enrollmentsService.remove(id); }
}
