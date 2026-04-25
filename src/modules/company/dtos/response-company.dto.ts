import { ApiProperty } from '@nestjs/swagger';

export class ResponseCompanyDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
    description: 'ID da empresa',
  })
  id: string;

  @ApiProperty({ example: '12345678000199', description: 'CNPJ da empresa' })
  cnpj: string;

  @ApiProperty({
    example: 'Empresa Exemplo Ltda',
    description: 'Nome da empresa',
  })
  name: string;

  @ApiProperty({
    example: 'Nome do Contato',
    description: 'Nome do contato principal',
  })
  contactName: string;

  @ApiProperty({
    example: 'contato@empresa.com',
    description: 'E-mail de contato',
  })
  contactEmail: string;

  @ApiProperty({
    example: 'ABC123',
    description: 'Código de acesso',
  })
  accessCode: string;

  @ApiProperty({ example: true, description: 'Empresa está ativa?' })
  isActive: boolean;
}

class ResponseCompanyPaginationMetaDto {
  @ApiProperty({
    example: 42,
    description: 'Quantidade total de empresas encontradas',
  })
  total: number;

  @ApiProperty({
    example: 1,
    description: 'Página atual',
  })
  page: number;

  @ApiProperty({
    example: 5,
    description: 'Última página disponível',
  })
  lastPage: number;

  @ApiProperty({
    example: 10,
    description: 'Quantidade de registros por página',
  })
  limit: number;
}

export class ResponseCompanyPaginationDto {
  @ApiProperty({
    type: [ResponseCompanyDto],
    description: 'Empresas retornadas na página atual',
  })
  data: ResponseCompanyDto[];

  @ApiProperty({
    type: ResponseCompanyPaginationMetaDto,
    description: 'Metadados de paginação',
  })
  meta: ResponseCompanyPaginationMetaDto;
}
