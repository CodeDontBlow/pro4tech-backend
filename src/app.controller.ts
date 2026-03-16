import { Controller, Get, Request } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorators';
import { Roles } from './auth/decorators/roles.decorators';
import { Role } from './auth/enums/role.enum';

@Controller()
export class AppController {
  
  @Public()
  @Get()
  getPublic() {
    return { message: 'Public Route - Any authenticated user can access' };
  }

  @Get('profile')
  getProfile(@Request() req) {
    return {
      message: 'Profile of the authenticated user',
      user: req.user
    };
  }

  @Roles(Role.Admin)
  @Get('admin')
  getAdmin(@Request() req) {
    return {
      message: 'Restricted Area - Only ADMIN can access',
      user: req.user
    };
  }

  @Roles(Role.Agent)
  @Get('agent')
  getAgent(@Request() req) {
    return {
      message: 'Restricted Area - Only AGENT can access',
      user: req.user
    };
  }

  @Roles(Role.Admin, Role.Agent)
  @Get('dashboard')
  getDashboard(@Request() req) {
    return {
      message: 'Dashboard - Admin OR Agent can access',
      user: req.user
    };
  }
}