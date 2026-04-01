import { IsString, IsOptional, IsBoolean, IsNotEmpty, ValidateIf } from 'class-validator';

export class CreateTriageRuleDto {
  @IsOptional()
  @IsString()
  parentId?: string;

  @ValidateIf((o) => !o.isLeaf)
  @IsNotEmpty({ message: 'Pergunta é obrigatória quando isLeaf é false' })
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
