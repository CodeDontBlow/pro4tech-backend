import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AdminService } from "./admin.service";
import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { Role } from "generated/prisma/client";
import { Roles } from "@modules/auth/decorators/roles.decorator";

@ApiTags('Admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {

    constructor(private readonly adminService: AdminService) {}

    @Get()
    @ApiOperation({ summary: 'Listar administradores' })
    @ApiResponse({status: 200,description: 'Lista de administradores'})
    @ApiQuery({ name: 'page', required: false, description: 'Número da página' })
    @ApiQuery({ name: 'limit', required: false, description: 'Número de itens por página' })
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ){
        return this.adminService.findAll({
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
        })
    }

}