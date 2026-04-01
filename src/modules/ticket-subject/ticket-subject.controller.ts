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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { TicketSubjectService } from './ticket-subject.service';
import { CreateTicketSubjectDto } from './dtos/create-ticket-subject.dto';
import { UpdateTicketSubjectDto } from './dtos/update-ticket-subject.dto';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { Public } from '@modules/auth/decorators/public.decorator';
import { Role } from '@prisma/enums';

@ApiTags('Ticket Subjects')
@ApiBearerAuth('bearer')
@Controller('ticket-subjects')
export class TicketSubjectController {
  constructor(private readonly service: TicketSubjectService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Listar assuntos de tíquetes',
    description: 'Retorna a lista de assuntos de tíquetes disponíveis. Endpoint público - não requer autenticação.',
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    description: 'Se \'true\', retorna também assuntos inativos. Padrão: \'false\' (apenas ativos)',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de assuntos obtida com sucesso',
  })
  findAll(@Query('includeInactive') includeInactive?: string) {
    const onlyActive = includeInactive !== 'true';
    return this.service.findAll(onlyActive);
  }

  @Get(':id')
  @Public()
  @ApiParam({
    name: 'id',
    description: 'ID do assunto de tíquete',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOperation({
    summary: 'Obter assunto de tíquete por ID',
    description: 'Retorna um assunto de tíquete específico. Endpoint público - não requer autenticação.',
  })
  @ApiResponse({
    status: 200,
    description: 'Assunto de tíquete obtido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Assunto de tíquete não encontrado',
  })
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Criar novo assunto de tíquete',
    description: 'Cria um novo assunto de tíquete. Requer autenticação ADMIN.',
  })
  @ApiBody({
    type: CreateTicketSubjectDto,
    description: 'Dados do novo assunto',
  })
  @ApiResponse({
    status: 201,
    description: 'Assunto de tíquete criado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Nome do assunto já existe',
  })
  create(@Body() dto: CreateTicketSubjectDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiParam({
    name: 'id',
    description: 'ID do assunto de tíquete a atualizar',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOperation({
    summary: 'Atualizar assunto de tíquete',
    description: 'Atualiza um assunto de tíquete existente. Requer autenticação ADMIN.',
  })
  @ApiResponse({
    status: 200,
    description: 'Assunto de tíquete atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Assunto de tíquete não encontrado',
  })
  update(@Param('id') id: string, @Body() dto: UpdateTicketSubjectDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({
    name: 'id',
    description: 'ID do assunto de tíquete a deletar',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOperation({
    summary: 'Deletar assunto de tíquete',
    description: 'Deleta um assunto de tíquete. Requer autenticação ADMIN.',
  })
  @ApiResponse({
    status: 204,
    description: 'Assunto de tíquete deletado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Assunto de tíquete não encontrado',
  })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
