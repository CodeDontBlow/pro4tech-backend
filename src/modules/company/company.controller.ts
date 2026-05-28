//services
import { CompanyService } from './company.service';

//dtos
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';

//decorators
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import {
  AuthUser,
  UserPayload,
} from 'src/common/decorators/auth-user.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Role } from 'generated/prisma/client';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import {
  ResponseCompanyDto,
  ResponseCompanyPaginationDto,
} from './dtos/response-company.dto';
import { StorageService } from '@modules/storage/storage.service';

//swagger
@ApiTags('Company')
@ApiBearerAuth()
//guards
@Roles(Role.ADMIN)
@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly storageService: StorageService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Cadastrar empresa' })
  @ApiResponse({
    status: 201,
    description: 'Empresa cadastrada com sucesso',
    type: ResponseCompanyDto,
  })
  @ApiResponse({
    status: 409,
    description: 'CNPJ ou e-mail de contato já está em uso',
  })
  create(@Body() dto: CreateCompanyDto) {
    return this.companyService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar empresas (paginado)' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Número da página (padrão: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Quantidade por página (padrão: 10)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Filtro textual por nome, CNPJ ou e-mail',
    example: 'Acme',
  })
  @ApiResponse({
    status: 200,
    description: 'Empresas listadas com sucesso',
    type: ResponseCompanyPaginationDto,
  })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.companyService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search,
    });
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualizar empresa do usuário autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Empresa atualizada com sucesso',
    type: ResponseCompanyDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa não encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'E-mail de contato já está em uso',
  })
  updateMe(@AuthUser() user: UserPayload, @Body() dto: UpdateCompanyDto) {
    return this.companyService.update(user.companyId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar empresa por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID da empresa',
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
  })
  @ApiResponse({
    status: 200,
    description: 'Empresa atualizada com sucesso',
    type: ResponseCompanyDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa não encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'E-mail de contato já está em uso',
  })
  update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.companyService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar empresa (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'ID da empresa a ser desativada',
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
  })
  @ApiResponse({
    status: 200,
    description: 'Empresa desativada com sucesso',
    type: ResponseCompanyDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Empresa não encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'Não é permitido desativar a própria empresa',
  })
  softDelete(@Param('id') id: string, @AuthUser() user: UserPayload) {
    return this.companyService.softDelete(id, user.companyId);
  }

  @Post(':id/logo')
  @ApiOperation({ summary: 'Atualizar logo da empresa' })
  @ApiParam({
    name: 'id',
    description: 'ID da empresa',
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: Number(process.env.LOGO_UPLOAD_MAX_MB ?? 5) * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowed.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Tipo de arquivo não permitido'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadLogo(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    const uploaded = await this.storageService.uploadBuffer({
      buffer: file.buffer,
      mimeType: file.mimetype,
      originalName: file.originalname,
      prefix: `logos/${id}`,
    });

    return this.companyService.update(id, {
      logoUrl: uploaded.url,
    });
  }
}
