import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
@ApiTags('systeme')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  @ApiOperation({ summary: 'Vérifier que l API RH IA répond' })
  getHello(): string {
    return this.appService.getHello();
  }
}
