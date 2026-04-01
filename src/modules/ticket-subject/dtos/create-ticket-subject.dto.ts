import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTicketSubjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}
