import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
//decorators
import {
  AuthUser,
  UserPayload,
} from 'src/common/decorators/auth-user.decorator';
import { Public } from 'src/auth/decorators/public.decorator';

//services
import { UserService } from './user.service';

//dtos
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';


@ApiTags('user')
@ApiBearerAuth() 
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  findMe(@AuthUser() user: UserPayload) {
    return this.userService.findById(user.sub);
  }

  @Public()
  @Post('register')
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Patch('me')
  update(@AuthUser() user: UserPayload, @Body() dto: UpdateUserDto) {
    return this.userService.update(user.sub, dto);
  }

  @Delete('me')
  delete(@AuthUser() user: UserPayload) {
    return this.userService.softDelete(user.sub);
  }
}
