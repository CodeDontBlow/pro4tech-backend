export class ResponseTriageRuleDto {
  id: string;
  parentId?: string;
  question?: string;
  answerTrigger?: string;
  isLeaf: boolean;
  targetGroupId?: string;
  subjectId?: string;
  children?: ResponseTriageRuleDto[];
  subject?: {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
  };
  supportGroup?: {
    id: string;
    name: string;
    description: string;
  };
}
