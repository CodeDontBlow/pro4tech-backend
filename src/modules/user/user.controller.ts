import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
//decorators
import {
  AuthUser,
  UserPayload,
} from 'src/common/decorators/auth-user.decorator';
import { Public } from '@modules/auth/decorators/public.decorator';

//services
import { UserService } from './user.service';

//dtos
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Role } from 'generated/prisma/client';
import { Roles } from '@modules/auth/decorators/roles.decorator';

//swagger
@ApiTags('user')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  findMe(@AuthUser() user: UserPayload) {
    return this.userService.findById(user.sub);
  }

  @Patch('me')
  updateMe(@AuthUser() user: UserPayload, @Body() dto: UpdateUserDto) {
    return this.userService.update(user.sub, dto);
  }

  @Delete('me')
  deleteMe(@AuthUser() user: UserPayload) {
    return this.userService.softDelete(user.sub);
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
}
