import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { AuthUser, UserPayload } from 'src/common/decorators/auth-user.decorator';
import { Public } from '@modules/auth/decorators/public.decorator';
import { Roles } from '@modules/auth/decorators/roles.decorator';

import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Role } from 'generated/prisma/client';
import { StorageService } from '@modules/storage/storage.service';

const avatarInterceptor = FileInterceptor('file', {
  storage: memoryStorage(),
  limits: { fileSize: Number(process.env.AVATAR_UPLOAD_MAX_MB ?? 5) * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new BadRequestException('Tipo de arquivo não permitido'), false);
    }
    cb(null, true);
  },
});

@ApiTags('user')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly storageService: StorageService,
  ) {}

  @Get('me')
  findMe(@AuthUser() user: UserPayload) {
    return this.userService.findById(user.sub);
  }

  @Patch('me')
  updateMe(@AuthUser() user: UserPayload, @Body() dto: UpdateUserDto) {
    return this.userService.update(user.sub, dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  updateById(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true })) dto: UpdateUserDto,
  ) {
    return this.userService.update(id, dto);
  }

  @Delete('me')
  deleteMe(@AuthUser() user: UserPayload) {
    return this.userService.softDelete(user.sub);
  }

  @Post('me/avatar')
  @UseInterceptors(avatarInterceptor)
  async uploadMyAvatar(
    @AuthUser() user: UserPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    const uploaded = await this.storageService.uploadBuffer({
      buffer: file.buffer,
      mimeType: file.mimetype,
      originalName: file.originalname,
      prefix: `avatars/${user.sub}`,
    });

    return this.userService.update(user.sub, { avatarUrl: uploaded.url });
  }

  @Public()
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  delete(@Param('id') id: string) {
    return this.userService.softDelete(id);
  }

  @Post(':id/avatar')
  @Roles(Role.ADMIN)
  @UseInterceptors(avatarInterceptor)
  async uploadAvatar(
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
      prefix: `avatars/${id}`,
    });

    return this.userService.update(id, { avatarUrl: uploaded.url });
  }
}