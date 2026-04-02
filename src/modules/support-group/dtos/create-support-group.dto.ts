import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateSupportGroupDto {
  @ApiProperty({
    example: 'Tier 1 Support',
    description: 'name of the team',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Responsible for initial troubleshooting.',
    description: 'Detailed description of the groups responsibilities',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: true,
    required: false,
    description: 'Defines if the group is available',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
