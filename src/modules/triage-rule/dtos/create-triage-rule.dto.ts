import { IsString, IsOptional, IsBoolean, IsNotEmpty, ValidateIf } from 'class-validator';

export class CreateTriageRuleDto {
  @IsOptional()
  @IsString()
  parentId?: string;

  @ValidateIf((o) => !o.isLeaf)
  @IsNotEmpty({ message: 'question is required when isLeaf is false' })
  @IsString()
  question?: string;

  @IsOptional()
  @IsString()
  answerTrigger?: string;

  @IsOptional()
  @IsBoolean()
  isLeaf?: boolean = false;

  @IsOptional()
  @IsString()
  targetGroupId?: string;

  @IsOptional()
  @IsString()
  subjectId?: string;
}
