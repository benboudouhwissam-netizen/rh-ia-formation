import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';

import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CertificationsService } from './certifications.service';

import { CreateCertificationDto } from '../dto/create-certification.dto';
import { UpdateCertificationDto } from '../dto/update-certification.dto';
import { FilterCertificationDto } from '../dto/filter-certification.dto';

@ApiTags('certifications')
@Controller('certifications')
export class CertificationsController {
  constructor(private readonly certificationsService: CertificationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Lister les certifications avec filtres',
  })
  findAll(@Query() filterDto: FilterCertificationDto) {
    return this.certificationsService.findAll(filterDto);
  }

  @Get('utilisateur/:utilisateurId')
  @ApiOperation({
    summary: "Lister les certifications d'un employé",
  })
  @ApiParam({
    name: 'utilisateurId',
    description: "UUID de l'employé",
  })
  findByUtilisateur(@Param('utilisateurId') utilisateurId: string) {
    return this.certificationsService.findByUtilisateur(utilisateurId);
  }

  @Get(':id')
  @ApiOperation({
    summary: "Détail d'une certification",
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la certification',
  })
  @ApiResponse({
    status: 404,
    description: 'Certification introuvable',
  })
  findOne(@Param('id') id: string) {
    return this.certificationsService.findOne(id);
  }

  @Get(':id/download')
  @Header('Content-Type', 'application/pdf')
  download(@Param('id') id: string, @Res() response: Response) {
    return this.certificationsService
      .generatePdf(id)
      .then(({ content, fileName }) => {
        response.setHeader(
          'Content-Disposition',
          `attachment; filename="${fileName}"`,
        );
        response.send(content);
      });
  }

  @Post()
  @ApiOperation({
    summary: 'Créer une certification',
  })
  create(@Body() createDto: CreateCertificationDto) {
    return this.certificationsService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Mettre à jour une certification',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la certification',
  })
  update(@Param('id') id: string, @Body() updateDto: UpdateCertificationDto) {
    return this.certificationsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer une certification',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la certification',
  })
  remove(@Param('id') id: string) {
    return this.certificationsService.remove(id);
  }
}
