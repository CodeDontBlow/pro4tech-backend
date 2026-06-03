import { ApiProperty } from '@nestjs/swagger';

export class ResponseAgentStandardMessageDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  agentId: string;

  @ApiProperty()
  companyId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  trigger: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
