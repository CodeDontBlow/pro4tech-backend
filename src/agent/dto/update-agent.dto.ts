import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { SupportLevel } from '../agent.entity';

export class UpdateAgentDto {
  @IsOptional()
  @IsEnum(SupportLevel)
  supportLevel?: SupportLevel;

  @IsOptional()
  @IsBoolean()
  canAnswer?: boolean;
}
