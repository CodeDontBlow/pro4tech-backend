import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { Public } from '@modules/auth/decorators/public.decorator';
import { UserPayload } from 'src/common/decorators/auth-user.decorator';
import { Server, Socket } from 'socket.io';
import { JoinRoomDto } from './dtos/join-room.dto';
import { SendMessageDto } from './dtos/send-message.dto';
import { UpdateMessageDto } from './dtos/update-message.dto';
import { DeleteMessageDto } from './dtos/delete-message.dto';
import { ChatService } from './chat.service';

type SocketWithUser = Socket & {
  data: {
    user?: UserPayload;
  };
};

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*',
  },
})
@Public()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  private server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) { }
  public emitToRoom(room: string, event: string, payload: any) {
    this.server.to(room).emit(event, payload);
  }

  public removeRoom(room: string) {
    this.server.in(room).socketsLeave(room);
  }


  async handleConnection(client: SocketWithUser): Promise<void> {
    const token = this.extractToken(client);
    if (!token) {
      client.emit('socketError', { message: 'Token não fornecido' });
      client.disconnect();
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<UserPayload>(token, {
        secret: process.env.JWT_SECRET,
      });

      client.data.user = payload;

      this.logger.log(
        `Socket autenticado — socketId: ${client.id}, userId: ${payload.sub}, role: ${payload.role}`,
      );
    } catch {
      client.emit('socketError', { message: 'Token inválido ou expirado' });
      client.disconnect();
    }
  }

  handleDisconnect(client: SocketWithUser): void {
    const userId = client.data.user?.sub ?? 'desconhecido';
    this.logger.log(`Socket desconectado — socketId: ${client.id}, userId: ${userId}`);
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() payload: JoinRoomDto,
  ) {
    const user = this.requireUser(client);

    await this.chatService.assertCanAccessTicket(payload.ticketId, user);

    const roomName = this.chatService.getRoomName(payload.ticketId);
    client.join(roomName);

    const history = await this.chatService.getTicketMessages(payload.ticketId);

    client.emit('joinedRoom', { ticketId: payload.ticketId });
    client.emit('chatHistory', history);

    return { ok: true };
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() payload: SendMessageDto,
  ) {
    const user = this.requireUser(client);

    await this.chatService.assertCanAccessTicket(payload.ticketId, user);

    const message = await this.chatService.saveMessage({
      ticketId: payload.ticketId,
      senderId: user.sub,
      senderRole: user.role as any,
      content: payload.content,
    });

    const roomName = this.chatService.getRoomName(payload.ticketId);
    this.emitToRoom(roomName, 'newMessage', message);

    return { ok: true, id: message.id };
  }

  @SubscribeMessage('updateMessage')
  async updateMessage(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() payload: UpdateMessageDto,
  ) {
    const user = this.requireUser(client);

    const message = await this.chatService.updateMessage({
      ticketId: payload.ticketId,
      messageId: payload.messageId,
      content: payload.content,
      user,
    });

    const roomName = this.chatService.getRoomName(payload.ticketId);
    this.server.to(roomName).emit('updatedMessage', message);

    return { ok: true, id: message.id };
  }

  @SubscribeMessage('deleteMessage')
  async deleteMessage(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() payload: DeleteMessageDto,
  ) {
    const user = this.requireUser(client);

    const message = await this.chatService.deleteMessage({
      ticketId: payload.ticketId,
      messageId: payload.messageId,
      user,
    });

    const roomName = this.chatService.getRoomName(payload.ticketId);
    this.server.to(roomName).emit('deletedMessage', message);

    return { ok: true, id: message.id };
  }

  private requireUser(client: SocketWithUser): UserPayload {
    const user = client.data.user;
    if (!user) {
      throw new Error('Usuário não autenticado no socket');
    }

    return user;
  }

  emitTicketClosed(ticketId: string) {
    const roomName = this.chatService.getRoomName(ticketId);

    this.emitToRoom(roomName, 'ticketClosed', {
      ticketId,
      status: 'CLOSED',
    });

    this.removeRoom(roomName);
  }

  private extractToken(client: Socket): string | undefined {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.trim().length > 0) {
      return authToken;
    }

    const authorization = client.handshake.headers.authorization;
    if (!authorization || Array.isArray(authorization)) {
      return undefined;
    }

    const [type, token] = authorization.split(' ') ?? [];
    if (type !== 'Bearer') {
      return undefined;
    }

    return token;
  }
}
