import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class FindAvailableAgentsQueryDto {
  @ApiPropertyOptional({
    description:
      'Support group id used to narrow results. For AGENT, this id must belong to one of its groups.',
    example: '0195f174-3fa5-7d74-b83c-54b718885e45',
  })
  @IsOptional()
  @IsUUID('7', { message: 'supportGroupId must be a valid UUID v7' })
  supportGroupId?: string;
}
