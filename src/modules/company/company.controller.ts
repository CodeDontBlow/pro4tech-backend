//services
import { CompanyService } from './company.service';

//dtos
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';

//decorators
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  AuthUser,
  UserPayload,
} from 'src/common/decorators/auth-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Role } from 'generated/prisma/client';
import { Roles } from '@modules/auth/decorators/roles.decorator';

//swagger
@ApiBearerAuth()
//guards
@Roles(Role.ADMIN)
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post('register')
  create(@Body() dto: CreateCompanyDto) {
    return this.companyService.create(dto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.companyService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search,
    });
  }

  @Patch('me')
  updateMe(@AuthUser() user: UserPayload, @Body() dto: UpdateCompanyDto) {
    return this.companyService.update(user.companyId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.companyService.update(id, dto);
  }

  @Delete(':id')
  softDelete(@Param('id') id: string, @AuthUser() user: UserPayload) {
    return this.companyService.softDelete(id, user.companyId);
  }
}
