import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SupportGroupService } from './support-group.service';
import { CreateSupportGroupDto } from './dtos/create-support-group.dto';
import { UpdateSupportGroupDto } from './dtos/update-support-group.dto';

@ApiTags('support-group')
@ApiBearerAuth()
@Controller('support-groups')
export class SupportGroupController {
  constructor(private readonly service: SupportGroupService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group' })
  create(@Body() dto: CreateSupportGroupDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all groups' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Search for a group ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a group' })
  update(@Param('id') id: string, @Body() dto: UpdateSupportGroupDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a group' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}