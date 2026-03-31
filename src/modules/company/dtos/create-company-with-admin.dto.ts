import { CreateCompanyDto } from './create-company.dto';
import { CreateAdminDto } from '../../user/dtos/create-admin.dto';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyWithAdminDto {
  @ApiProperty({
    type: () => CreateCompanyDto,
    description: 'Dados da empresa',
  })
  @ValidateNested()
  @Type(() => CreateCompanyDto)
  company: CreateCompanyDto;

  @ApiProperty({
    type: () => CreateAdminDto,
    description: 'Dados do administrador',
  })
  @ValidateNested()
  @Type(() => CreateAdminDto)
  admin: CreateAdminDto;
}
