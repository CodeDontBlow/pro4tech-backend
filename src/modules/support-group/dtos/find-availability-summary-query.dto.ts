import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class FindAvailabilitySummaryQueryDto {
  @ApiPropertyOptional({
    description:
      'ID do grupo de suporte usado para filtrar o resultado. Para AGENT, este ID deve pertencer a um dos seus grupos.',
    example: '',
  })
  @IsOptional()
  @IsUUID('7', { message: 'supportGroupId deve ser um UUID v7 válido' })
  supportGroupId?: string;
}
