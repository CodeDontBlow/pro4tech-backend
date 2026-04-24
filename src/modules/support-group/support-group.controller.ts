import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { SupportGroupService } from './support-group.service';
import { CreateSupportGroupDto } from './dtos/create-support-group.dto';
import { UpdateSupportGroupDto } from './dtos/update-support-group.dto';
import { Role } from 'generated/prisma/client';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import {
  AuthUser,
  UserPayload,
} from 'src/common/decorators/auth-user.decorator';
import { FindAvailabilitySummaryQueryDto } from './dtos/find-availability-summary-query.dto';
import { ResponseAvailableAgentsSummaryDto } from './dtos/response-available-agents.dto';

//swagger
@ApiTags('support-group')
@ApiBearerAuth()
//guard
@Roles(Role.ADMIN, Role.AGENT)
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

  @Get('me/agents/availability-summary')
  @ApiOperation({
    summary: 'List available agents grouped by visible support groups',
  })
  @ApiQuery({
    name: 'supportGroupId',
    required: false,
    type: String,
    description:
      'Optional support group id used to narrow the result inside your authorization scope.',
  })
  @ApiResponse({
    status: 200,
    description: 'Availability summary listed successfully',
    type: ResponseAvailableAgentsSummaryDto,
  })
  @ApiResponse({
    status: 403,
    description: 'You are not allowed to read this support group availability',
  })
  @ApiResponse({ status: 404, description: 'Support group not found' })
  findAvailabilitySummary(
    @AuthUser() user: UserPayload,
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: FindAvailabilitySummaryQueryDto,
  ): Promise<ResponseAvailableAgentsSummaryDto> {
    return this.service.findAvailabilitySummary(user, query.supportGroupId);
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
