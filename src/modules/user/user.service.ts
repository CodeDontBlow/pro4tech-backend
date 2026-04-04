import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';
import { Role } from 'generated/prisma/client';
import { SupportLevel } from 'generated/prisma/client';

//repositories
import { UserRepository } from './user.repository';

//dtos
import { ResponseUserDto } from './dtos/response-user.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

//services
import { AgentService } from '@modules/agent/agent.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    @Inject(forwardRef(() => AgentService))
    private readonly agentService: AgentService,
  ) {}

  async findByEmail(email: string): Promise<ResponseUserDto | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      this.logger.warn(`User not found — email: ${email}`);
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByPhone(phone: string): Promise<ResponseUserDto | null> {
    const user = await this.userRepository.findByPhone(phone);
    if (!user) {
      this.logger.warn(`User not found — phone: ${phone}`);
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findById(id: string): Promise<ResponseUserDto | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      this.logger.warn(`User not found — id: ${id}`);
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmailForAuth(
    email: string,
  ): Promise<(ResponseUserDto & { hashedPassword: string }) | null> {
    return this.userRepository.findByEmailWithPassword(email);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.updateLastLogin(id);
  }

  async create(data: CreateUserDto): Promise<ResponseUserDto> {
    await this.validateEmailNotInUse(data.email);
    await this.validatePhoneNotInUse(data.phone);

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const userId = uuidv7();
    const user = await this.userRepository.create({
      id: userId,
      ...data,
      password: hashedPassword,
    });

    this.logger.log(`User created — id: ${user.id}`);

    // Se o role é AGENT, criar registro na tabela Agent
    if (user.role === Role.AGENT) {
      try {
        await this.agentService.create({
          userId: user.id,
          supportLevel: SupportLevel.LEVEL_1,
          canAnswer: true,
        });
        this.logger.log(`Agent created for user — userId: ${user.id}`);
      } catch (error) {
        this.logger.error(`Failed to create agent for user ${user.id}`, error);
        // Não deixar falhar o fluxo todo, apenas logar o erro
      }
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<ResponseUserDto> {
    await this.findById(id);
    await this.validatePhoneNotInUse(dto.phone, id);

    const user = await this.userRepository.update(id, dto);
    this.logger.log(`User updated — id: ${id}`);
    return user;
  }

  async validateEmailNotInUse(email: string, ignoreUserId?: string) {
    if (!email) return;
    const user = await this.userRepository.findByEmail(email);
    if (user && user.id !== ignoreUserId) {
      this.logger.warn(`Email already in use: ${email}`);
      throw new ConflictException(`Email ${email} already in use`);
    }
  }

  async validatePhoneNotInUse(phone: string, ignoreUserId?: string) {
    if (!phone) return;
    const user = await this.userRepository.findByPhone(phone);
    if (user && user.id !== ignoreUserId) {
      this.logger.warn(`Phone already in use: ${phone}`);
      throw new ConflictException(`Phone ${phone} already in use`);
    }
  }

  async softDelete(id: string): Promise<ResponseUserDto> {
    const user = await this.findById(id);

    // Se o role é AGENT, soft-delete também na tabela Agent
    if (user.role === Role.AGENT) {
      try {
        await this.agentService.softDelete(id);
        this.logger.log(`Agent soft-deleted for user — userId: ${id}`);
      } catch (error) {
        this.logger.error(`Failed to soft-delete agent for user ${id}`, error);
        // Log error mas continuar com soft delete do User
      }
    }

    const deletedUser = await this.userRepository.softDelete(id);
    this.logger.log(`User soft deleted — id: ${id}`);
    return deletedUser;
  }
}
