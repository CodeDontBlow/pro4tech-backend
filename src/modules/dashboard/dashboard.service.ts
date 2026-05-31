import { Injectable, Logger } from "@nestjs/common";
import { TicketService } from "../ticket/ticket.service";
import { ChatService } from "../chat/chat.service";
import { UserService } from "../user/user.service";
import { ResponsePaginationDto } from "@common/dtos/response-pagination.dto";
import { ChatStatus, Role } from "generated/prisma/client";

@Injectable()
export class DashboardService {
    private readonly logger = new Logger(DashboardService.name);

    constructor(
        private readonly ticketService: TicketService,
        private readonly chatService: ChatService,
        private readonly userService: UserService,
    ) {}

    async getDashboardOverview() {
        this.logger.log('Fetching dashboard overview');

        const onlineStatuses = [
            ChatStatus.ONLINE,
            ChatStatus.BUSY,
            ChatStatus.AWAY,
        ];

        const [
            totalOpenTickets,
            totalClosedTickets,
            totalInProgressTickets,
            totalReopenedTickets,
            avgFirstResponseTimeMs,
            avgResolutionTimeMs,
            satisfactionDistribution,
            volumeByHour,
            agentOnline,
            agentOffline,
        ] = await Promise.all([
            this.ticketService.countOpenTickets(),
            this.ticketService.countClosedTickets(),
            this.ticketService.countInProgressTickets(),
            this.ticketService.countReopenedTickets(),
            this.chatService.getAverageFirstResponseTimeMs(),
            this.ticketService.getAverageResolutionTimeMs(),
            this.ticketService.getCustomerSatisfactionDistribution(),
            this.ticketService.getTicketVolumeByHour(),
            this.userService.countByChatStatus({
                role: Role.AGENT,
                isActive: true,
                chatStatus: onlineStatuses,
            }),
            this.userService.countByChatStatus({
                role: Role.AGENT,
                isActive: true,
                chatStatus: ChatStatus.OFFLINE,
            }),
        ]);

        const avgFirstResponseMinutes = this.toMinutes(avgFirstResponseTimeMs);
        const avgResolutionMinutes = this.toMinutes(avgResolutionTimeMs);

        return {
            totalOpenTickets,
            totalClosedTickets,
            totalInProgressTickets,
            totalReopenedTickets,
            avgFirstResponseMinutes,
            avgFirstResponseLabel: this.toHourMinuteLabel(avgFirstResponseMinutes),
            avgResolutionMinutes,
            avgResolutionLabel: this.toHourMinuteLabel(avgResolutionMinutes),
            satisfactionDistribution,
            volumeByHour,
            agentOnline,
            agentOffline,
        };
    }

    async getDashboardAgents(input: {
        periodDays?: number;
        name?: string;
        page: number;
        limit: number;
    }) {
        const since = this.resolveSince(input.periodDays);
        const filters = {
            since,
            agentName: input.name,
        };

        const [agentRows, agentTotal, firstResponseByAgent] = await Promise.all([
            this.ticketService.getAgentTicketStats(
                filters,
                {
                    page: input.page,
                    limit: input.limit,
                },
            ),
            this.ticketService.getAgentTicketStatsTotal(filters),
            this.chatService.getAverageFirstResponseTimeByAgentMs(filters),
        ]);

        const agentData = agentRows.map((row) => {
            const avgFirstMs = firstResponseByAgent[row.agentId] ?? 0;
            const avgFirstMinutes = this.toMinutes(avgFirstMs);
            const avgResolutionMinutes = this.toMinutes(row.avgResolutionMs);
            return {
                agentId: row.agentId,
                agentName: row.agentName,
                closedCount: row.closedCount,
                avgFirstResponseMinutes: avgFirstMinutes,
                avgFirstResponseLabel: this.toHourMinuteLabel(avgFirstMinutes),
                avgResolutionMinutes,
                avgResolutionLabel: this.toHourMinuteLabel(avgResolutionMinutes),
                ratingAverage: this.roundRating(row.ratingAverage),
                ratingCount: row.ratingCount,
            };
        });

        return new ResponsePaginationDto(
            agentData,
            agentTotal,
            input.page,
            input.limit,
        );
    }

    async getDashboardCompanies(input: {
        periodDays?: number;
        name?: string;
        page: number;
        limit: number;
    }) {
        const since = this.resolveSince(input.periodDays);
        const filters = {
            since,
            companyName: input.name,
        };

        const [companyRows, companyTotal] = await Promise.all([
            this.ticketService.getCompanyTicketStats(
                filters,
                {
                    page: input.page,
                    limit: input.limit,
                },
            ),
            this.ticketService.getCompanyTicketStatsTotal(filters),
        ]);

        const companyData = companyRows.map((row) => ({
            companyId: row.companyId,
            companyName: row.companyName,
            ticketCount: row.ticketCount,
            ratingAverage: this.roundRating(row.ratingAverage),
            ratingCount: row.ratingCount,
        }));

        return new ResponsePaginationDto(
            companyData,
            companyTotal,
            input.page,
            input.limit,
        );
    }

    async getDashboardQuality(input: { periodDays?: number }) {
        const since = this.resolveSince(input.periodDays);

        const [reopenRatePercent, ticketsPerSubject] = await Promise.all([
            this.ticketService.getReopenRatePercent(since),
            this.ticketService.getTicketsPerSubject(since),
        ]);

        return {
            reopenRatePercent,
            ticketsPerSubject,
        };
    }

    private resolveSince(periodDays?: number): Date | undefined {
        if (!periodDays || !Number.isFinite(periodDays) || periodDays <= 0) {
            return undefined;
        }

        const since = new Date();
        since.setDate(since.getDate() - Math.floor(periodDays));
        return since;
    }

    private toMinutes(milliseconds: number): number {
        if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
            return 0;
        }

        return Math.round(milliseconds / 60000);
    }

    private toHourMinuteLabel(totalMinutes: number): string {
        if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) {
            return '00:00';
        }

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const paddedHours = String(hours).padStart(2, '0');
        const paddedMinutes = String(minutes).padStart(2, '0');
        return `${paddedHours}:${paddedMinutes}`;
    }

    private roundRating(value: number | null): number | null {
        if (value === null || value === undefined) {
            return null;
        }

        return Math.round(value * 100) / 100;
    }
}
    