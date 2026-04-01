import { PartialType } from '@nestjs/swagger';
import { CreateSupportGroupDto } from './create-support-group.dto';

export class UpdateSupportGroupDto extends PartialType(CreateSupportGroupDto) {}
