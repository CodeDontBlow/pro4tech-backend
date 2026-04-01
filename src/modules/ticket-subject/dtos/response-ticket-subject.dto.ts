import { ApiProperty } from '@nestjs/swagger';

export class ResponseTicketSubjectDto {
  @ApiProperty({
    description: 'ID único do assunto (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do assunto do tíquete',
    example: 'Erro na Nota Fiscal',
  })
  name: string;

  @ApiProperty({
    description: 'Descrição detalhada do assunto',
    example: 'Problemas relacionados à geração ou validação de notas fiscais',
  })
  description: string;

  @ApiProperty({
    description: 'Se o assunto está ativo',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Data de criação do assunto',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Última data de atualização',
    example: '2024-01-15T14:45:00Z',
  })
  updatedAt: Date;
}
