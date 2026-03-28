import { IsString, IsNotEmpty } from 'class-validator';

export class AssignClientDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  accessCode: string; 
}