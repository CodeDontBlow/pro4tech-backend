import { Roles } from "@modules/auth/decorators/roles.decorator";
import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Role } from 'generated/prisma/client';
import { DashboardService } from "./dashboard.service";

@ApiTags('Dashboard')
@ApiBearerAuth()

@Controller('dashboard')
@Roles(Role.ADMIN)
export class DashboardController {

    constructor(private readonly dashboardService: DashboardService) { }

    @Get('overview')
    @ApiOperation({ summary: 'Obter visão geral do dashboard' })
    @ApiResponse({
        status: 200,
        description: 'Visão geral do dashboard obtida com sucesso',
    })
    getDashboardOverview() {
        return this.dashboardService.getDashboardOverview();
    }

    @Get('agents')
    @ApiOperation({ summary: 'Obter tabela por atendente' })
    @ApiQuery({ name: 'periodDays', required: false, type: Number })
    @ApiQuery({ name: 'name', required: false, type: String })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({
        status: 200,
        description: 'Tabela por atendente obtida com sucesso',
    })
    getDashboardAgents(
        @Query('periodDays') periodDays?: string,
        @Query('name') name?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.dashboardService.getDashboardAgents({
            periodDays: periodDays ? Number(periodDays) : undefined,
            name,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
        });
    }

    @Get('companies')
    @ApiOperation({ summary: 'Obter tabela por clientes (empresas)' })
    @ApiQuery({ name: 'periodDays', required: false, type: Number })
    @ApiQuery({ name: 'name', required: false, type: String })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({
        status: 200,
        description: 'Tabela por clientes obtida com sucesso',
    })
    getDashboardCompanies(
        @Query('periodDays') periodDays?: string,
        @Query('name') name?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.dashboardService.getDashboardCompanies({
            periodDays: periodDays ? Number(periodDays) : undefined,
            name,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
        });
    }

    @Get('quality')
    @ApiOperation({ summary: 'Obter métricas de qualidade' })
    @ApiQuery({ name: 'periodDays', required: false, type: Number })
    @ApiResponse({
        status: 200,
        description: 'Métricas de qualidade obtidas com sucesso',
    })
    getDashboardQuality(
        @Query('periodDays') periodDays?: string,
    ) {
        return this.dashboardService.getDashboardQuality({
            periodDays: periodDays ? Number(periodDays) : undefined,
        });
    }
}
