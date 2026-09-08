import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './entities/contract.entity';
import { Diploma } from './entities/diploma.entity';
import { Document } from './entities/document.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { CreateDiplomaDto } from './dto/create-diploma.dto';
import { CreateDocumentDto } from './dto/create-document.dto';

class UpdateContractDto extends PartialType(CreateContractDto) {}
class UpdateDiplomaDto extends PartialType(CreateDiplomaDto) {}
class UpdateDocumentDto extends PartialType(CreateDocumentDto) {}

@Controller('lot3')
export class Lot3Controller {
  constructor(
    @InjectRepository(Contract) private readonly contracts: Repository<Contract>,
    @InjectRepository(Diploma) private readonly diplomas: Repository<Diploma>,
    @InjectRepository(Document) private readonly documents: Repository<Document>,
  ) {}

  @Get('contracts') listContracts(@Query('employee_id') employeeId: string) {
    return this.contracts.find({ where: { employee_id: employeeId }, order: { start_date: 'DESC' } });
  }

  @Get('diplomas') listDiplomas(@Query('employee_id') employeeId: string) {
    return this.diplomas.find({ where: { employee_id: employeeId }, order: { year: 'DESC' } });
  }

  @Get('documents') listDocuments(@Query('employee_id') employeeId: string) {
    return this.documents.find({ where: { employee_id: employeeId }, order: { created_at: 'DESC' } });
  }

  @Post('contracts') createContract(@Body() payload: CreateContractDto) {
    return this.contracts.save(this.contracts.create(payload));
  }

  @Post('diplomas') createDiploma(@Body() payload: CreateDiplomaDto) {
    return this.diplomas.save(this.diplomas.create(payload));
  }

  @Post('documents') createDocument(@Body() payload: CreateDocumentDto) {
    return this.documents.save(this.documents.create(payload));
  }

  @Patch('contracts/:id') updateContract(@Param('id') id: string, @Body() payload: UpdateContractDto) {
    return this.contracts.preload({ id, ...payload }).then((entity) => entity ? this.contracts.save(entity) : null);
  }

  @Patch('diplomas/:id') updateDiploma(@Param('id') id: string, @Body() payload: UpdateDiplomaDto) {
    return this.diplomas.preload({ id, ...payload }).then((entity) => entity ? this.diplomas.save(entity) : null);
  }

  @Patch('documents/:id') updateDocument(@Param('id') id: string, @Body() payload: UpdateDocumentDto) {
    return this.documents.preload({ id, ...payload }).then((entity) => entity ? this.documents.save(entity) : null);
  }
}
