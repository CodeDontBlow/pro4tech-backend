//services
import { CompanyService } from './company.service';

//dtos
import { CreateCompanyWithAdminDto } from './dtos/create-company-with-admin.dto';

//decorators
import { Public } from 'src/auth/decorators/public.decorator';
import { Body, Controller, Delete, Patch, Post } from '@nestjs/common';
import { AuthUser, UserPayload } from 'src/common/decorators/auth-user.decorator';
import { UpdateCompanyDto } from './dtos/update-company.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Public()
  @Post('register')
  createCompanyAndAdminUser(@Body() dto: CreateCompanyWithAdminDto) {
    return this.companyService.createCompanyAndAdminUser(dto);
  }

  @Patch('me')
  update(@AuthUser() user: UserPayload, @Body() dto: UpdateCompanyDto) {
    return this.companyService.update(user.companyId, dto);
  }

  @Delete('me')
  delete(@AuthUser() user: UserPayload) {
    return this.companyService.softDelete(user.companyId);
  }

}
