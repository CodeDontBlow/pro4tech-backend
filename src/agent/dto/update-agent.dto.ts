import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAgentDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  supportLevel?: string;

  @IsOptional()
  @IsBoolean()
  canAnswer?: boolean;
}
