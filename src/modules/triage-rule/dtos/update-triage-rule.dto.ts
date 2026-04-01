import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateTriageRuleDto {
  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsString()
  answerTrigger?: string;

  @IsOptional()
  @IsBoolean()
  isLeaf?: boolean;

  @IsOptional()
  @IsString()
  targetGroupId?: string;

  @IsOptional()
  @IsString()
  subjectId?: string;
}
