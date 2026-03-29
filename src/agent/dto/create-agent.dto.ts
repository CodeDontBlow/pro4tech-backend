import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAgentDto {
  @IsString()
  @IsNotEmpty()
  agentId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  supportLevel: string;

  @IsBoolean()
  canAnswer: boolean;
}
