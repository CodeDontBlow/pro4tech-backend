import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TicketRepository } from '@modules/ticket/ticket.repository';
import { UserPayload } from 'src/common/decorators/auth-user.decorator';
import { Role } from 'generated/prisma/client';
import { Model } from 'mongoose';
import {
  ChatMessage,
  ChatMessageDocument,
} from './schemas/chat-message.schema';

export type ChatMessageOutput = {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: Role;
  content: string;
  createdAt: Date;
  editedAt?: Date | null;
  deletedAt?: Date | null;
};

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatMessage.name)
    private readonly messageModel: Model<ChatMessageDocument>,
    private readonly ticketRepository: TicketRepository,
  ) {}

  getRoomName(ticketId: string): string {
    return `ticket:${ticketId}`;
  }

  async assertCanAccessTicket(ticketId: string, user: UserPayload) {
    const ticket = await this.ticketRepository.findById(ticketId, {
      includeArchived: false,
      includeDeleted: false,
    });

    if (!ticket) {
      throw new NotFoundException('Ticket não encontrado para o chat');
    }

    if (!ticket.agentId) {
      throw new ForbiddenException(
        'Chat liberado apenas após um agente assumir o ticket',
      );
    }

    if (user.role === Role.ADMIN) {
      return ticket;
    }

    if (user.role === Role.CLIENT && ticket.clientId === user.sub) {
      return ticket;
    }

    if (user.role === Role.AGENT && ticket.agentId === user.sub) {
      return ticket;
    }

    throw new ForbiddenException('Você não tem acesso a este chat');
  }

  async getTicketMessages(ticketId: string): Promise<ChatMessageOutput[]> {
    const messages = await this.messageModel
      .find({ ticketId })
      .sort({ createdAt: 1 })
      .lean();

    return messages.map((message) => ({
      id: String(message._id),
      ticketId: message.ticketId,
      senderId: message.senderId,
      senderRole: message.senderRole,
      content: message.content,
      createdAt: message.createdAt,
      editedAt: message.editedAt ?? null,
      deletedAt: message.deletedAt ?? null,
    }));
  }

  async saveMessage(input: {
    ticketId: string;
    senderId: string;
    senderRole: Role;
    content: string;
  }): Promise<ChatMessageOutput> {
    const content = input.content.trim();
    if (!content) {
      throw new BadRequestException('Mensagem vazia não é permitida');
    }

    const created = await this.messageModel.create({
      ticketId: input.ticketId,
      senderId: input.senderId,
      senderRole: input.senderRole,
      content,
    });

    return this.toOutput(created);
  }

  async updateMessage(input: {
    ticketId: string;
    messageId: string;
    content: string;
    user: UserPayload;
  }): Promise<ChatMessageOutput> {
    await this.assertCanAccessTicket(input.ticketId, input.user);

    const message = await this.messageModel.findOne({
      _id: input.messageId,
      ticketId: input.ticketId,
    });

    if (!message) {
      throw new NotFoundException('Mensagem nao encontrada');
    }

    if (message.deletedAt) {
      throw new BadRequestException('Mensagem removida nao pode ser editada');
    }

    if (input.user.role !== Role.ADMIN && message.senderId !== input.user.sub) {
      throw new ForbiddenException('Apenas o autor pode editar esta mensagem');
    }

    const content = input.content.trim();
    if (!content) {
      throw new BadRequestException('Mensagem vazia nao e permitida');
    }

    message.content = content;
    message.editedAt = new Date();
    await message.save();

    return this.toOutput(message);
  }

  async deleteMessage(input: {
    ticketId: string;
    messageId: string;
    user: UserPayload;
  }): Promise<ChatMessageOutput> {
    await this.assertCanAccessTicket(input.ticketId, input.user);

    const message = await this.messageModel.findOne({
      _id: input.messageId,
      ticketId: input.ticketId,
    });

    if (!message) {
      throw new NotFoundException('Mensagem nao encontrada');
    }

    if (input.user.role !== Role.ADMIN && message.senderId !== input.user.sub) {
      throw new ForbiddenException('Apenas o autor pode remover esta mensagem');
    }

    if (!message.deletedAt) {
      message.deletedAt = new Date();
      message.content = '';
      await message.save();
    }

    return this.toOutput(message);
  }

  async getAverageFirstResponseTimeMs(): Promise<number> {
    const ticketWhere: any = {
      deletedAt: null,
      isArchived: false,
    };

    const tickets = await this.ticketRepository.findMany(ticketWhere);
    if (tickets.length === 0) {
      return 0;
    }

    const ticketIds = tickets.map((ticket) => ticket.id);
    const ticketCreatedAtById = new Map(
      tickets.map((ticket) => [ticket.id, ticket.createdAt]),
    );

    const firstResponses = await this.messageModel.aggregate<{
      _id: string;
      firstResponseAt: Date;
    }>([
      {
        $match: {
          senderRole: Role.AGENT,
          $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
          ticketId: { $in: ticketIds },
        },
      },
      {
        $group: {
          _id: '$ticketId',
          firstResponseAt: { $min: '$createdAt' },
        },
      },
    ]);

    if (firstResponses.length === 0) {
      return 0;
    }

    let totalMs = 0;
    let count = 0;

    for (const item of firstResponses) {
      const createdAt = ticketCreatedAtById.get(item._id);
      if (!createdAt) {
        continue;
      }

      totalMs += item.firstResponseAt.getTime() - createdAt.getTime();
      count += 1;
    }

    if (count === 0) {
      return 0;
    }

    return Math.round(totalMs / count);
  }

  async getAverageFirstResponseTimeByAgentMs(
    options: { since?: Date } = {},
  ): Promise<Record<string, number>> {
    const { since } = options;
    const ticketWhere: any = {
      deletedAt: null,
      isArchived: false,
      agentId: { not: null },
    };

    if (since) {
      ticketWhere.createdAt = { gte: since };
    }

    const tickets = await this.ticketRepository.findMany(ticketWhere);
    if (tickets.length === 0) {
      return {};
    }

    const ticketIds = tickets.map((ticket) => ticket.id);
    const ticketCreatedAtById = new Map(
      tickets.map((ticket) => [ticket.id, ticket.createdAt]),
    );

    const firstResponses = await this.messageModel.aggregate<{
      _id: { ticketId: string; agentId: string };
      firstResponseAt: Date;
    }>([
      {
        $match: {
          senderRole: Role.AGENT,
          $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
          ticketId: { $in: ticketIds },
        },
      },
      {
        $group: {
          _id: { ticketId: '$ticketId', agentId: '$senderId' },
          firstResponseAt: { $min: '$createdAt' },
        },
      },
    ]);

    const totals = new Map<string, { totalMs: number; count: number }>();

    for (const item of firstResponses) {
      const createdAt = ticketCreatedAtById.get(item._id.ticketId);
      if (!createdAt) {
        continue;
      }

      const diff = item.firstResponseAt.getTime() - createdAt.getTime();
      const current = totals.get(item._id.agentId) ?? { totalMs: 0, count: 0 };
      current.totalMs += diff;
      current.count += 1;
      totals.set(item._id.agentId, current);
    }

    const result: Record<string, number> = {};
    for (const [agentId, value] of totals) {
      result[agentId] = value.count > 0 ? Math.round(value.totalMs / value.count) : 0;
    }

    return result;
  }

  private toOutput(message: ChatMessageDocument): ChatMessageOutput {
    return {
      id: String(message._id),
      ticketId: message.ticketId,
      senderId: message.senderId,
      senderRole: message.senderRole,
      content: message.content,
      createdAt: message.createdAt,
      editedAt: message.editedAt ?? null,
      deletedAt: message.deletedAt ?? null,
    };
  }
}
