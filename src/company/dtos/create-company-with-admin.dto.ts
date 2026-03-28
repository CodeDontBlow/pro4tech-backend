import { CreateCompanyDto } from './create-company.dto';
import { CreateAdminDto } from '../../user/dtos/create-admin.dto';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCompanyWithAdminDto {
  @ValidateNested()
  @Type(() => CreateCompanyDto)
  company: CreateCompanyDto;

  @ValidateNested()
  @Type(() => CreateAdminDto)
  admin: CreateAdminDto;
}
