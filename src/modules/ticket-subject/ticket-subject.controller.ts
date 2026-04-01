import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { TicketSubjectService } from './ticket-subject.service';
import { CreateTicketSubjectDto } from './dtos/create-ticket-subject.dto';
import { UpdateTicketSubjectDto } from './dtos/update-ticket-subject.dto';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { Role } from '@prisma/enums';

@Controller('ticket-subjects')
export class TicketSubjectController {
  constructor(private readonly service: TicketSubjectService) {}

  @Get()
  findAll(@Query('includeInactive') includeInactive?: string) {
    const onlyActive = includeInactive !== 'true';
    return this.service.findAll(onlyActive);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateTicketSubjectDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateTicketSubjectDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
