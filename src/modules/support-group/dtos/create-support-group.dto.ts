import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateSupportGroupDto {
  @ApiProperty({
    example: 'Suporte Nível 1',
    description: 'Nome do grupo de suporte',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @ApiProperty({
    example: 'Responsável pelo atendimento inicial e triagem de chamados.',
    description: 'Descrição detalhada das responsabilidades do grupo',
  })
  @IsString()
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  description: string;

  @ApiProperty({
    example: true,
    required: false,
    description: 'Define se o grupo está ativo',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
