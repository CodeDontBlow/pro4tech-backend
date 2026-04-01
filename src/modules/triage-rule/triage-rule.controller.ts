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
} from '@nestjs/common';
import { TriageRuleService } from './triage-rule.service';
import { CreateTriageRuleDto } from './dtos/create-triage-rule.dto';
import { UpdateTriageRuleDto } from './dtos/update-triage-rule.dto';
import { TraverseTriageRuleDto } from './dtos/traverse-triage-rule.dto';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { Public } from '@modules/auth/decorators/public.decorator';
import { Role } from '@prisma/enums';

@Controller('triage-rules')
export class TriageRuleController {
  constructor(private readonly service: TriageRuleService) {}

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.service.findAll();
  }

  /**
   * GET /triage-rules/react-flow
   * Retorna árvore em formato React Flow (nodes + edges)
   * Ideal para frontend renderizar com react-flow-renderer
   */
  @Get('react-flow')
  @Roles(Role.ADMIN)
  findAllReactFlow() {
    return this.service.findAllReactFlow();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateTriageRuleDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateTriageRuleDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Post('traverse')
  @Public()
  @HttpCode(HttpStatus.OK)
  traverse(@Body() dto: TraverseTriageRuleDto) {
    return this.service.traverse(dto.answerTrigger);
  }

  @Post(':id/traverse')
  @Public()
  @HttpCode(HttpStatus.OK)
  traverseFrom(@Param('id') id: string, @Body() dto: TraverseTriageRuleDto) {
    return this.service.traverse(dto.answerTrigger, id);
  }
}
