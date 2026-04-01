import { IsString, IsNotEmpty } from 'class-validator';

export class TraverseTriageRuleDto {
  @IsNotEmpty()
  @IsString()
  answerTrigger: string;
}

export class TraverseResponseDto {
  id: string;
  question?: string;
  answerTrigger?: string;
  isLeaf: boolean;
  children?: {
    id: string;
    answerTrigger: string;
  }[];
  subject?: {
    id: string;
    name: string;
    description: string;
  };
  targetGroupId?: string;
}
