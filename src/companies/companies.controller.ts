import { Controller, Post, Body } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { AssignClientDto } from './dto/assign-client.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post() // PT-79 e PT-78: Criar empresa e gerar código
  create(@Body() dto: CreateCompanyDto) {
    return this.companiesService.create(dto);
  }

@Post('assign') // PT-79 & PT-80: Link user to company using code
  assign(@Body() dto: AssignClientDto) {
    return this.companiesService.assignUser(dto);
  }
}