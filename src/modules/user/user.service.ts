import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
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
import { CompanyService } from '@modules/company/company.service';
import { PrismaService } from '@database/prisma/prisma.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly userRepository: UserRepository,
    @Inject(forwardRef(() => AgentService))
    private readonly agentService: AgentService,
    private readonly companyService: CompanyService,
  ) {}

  // Finders
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

  // CRUD
  async create(data: CreateUserDto): Promise<ResponseUserDto> {
    await this.validateEmailNotInUse(data.email);
    if (data.phone) await this.validatePhoneNotInUse(data.phone);

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const companyId = await this.resolveCompanyId(data);
    const userId = uuidv7();

    const company = await this.companyService.findById(companyId);
    if (!company) {
      throw new NotFoundException(`Company not found — id: ${companyId}`);
    }

    if (data.role === Role.AGENT) {
      return await this.createUserAgentProfile(
        data,
        companyId,
        hashedPassword,
        userId,
      );
    }

    const user = await this.userRepository.create(
      {
        ...data,
        companyId: companyId,
        password: hashedPassword,
      },
      userId,
    );

    this.logger.log(`User created successfully — id: ${user.id}`);
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<ResponseUserDto> {
    await this.findById(id);
    await this.validatePhoneNotInUse(dto.phone, id);

    const user = await this.userRepository.update(id, dto);
    this.logger.log(`User updated — id: ${id}`);
    return user;
  }
  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.updateLastLogin(id);
  }

  async softDelete(id: string): Promise<ResponseUserDto> {
    const user = await this.findById(id);
    if (user.role === Role.AGENT) {
      try {
        await this.agentService.softDelete(id);
        this.logger.log(`Agent soft-deleted for user — userId: ${id}`);
      } catch (error) {
        this.logger.error(`Failed to soft-delete agent for user ${id}`, error);
      }
    }
    const deletedUser = await this.userRepository.softDelete(id);
    this.logger.log(`User soft deleted — id: ${id}`);
    return deletedUser;
  }

  // --- MÉTODOS AUXILIARES (PRIVADOS) ---
  private async validateEmailNotInUse(email: string, ignoreUserId?: string) {
    if (!email) return;
    const user = await this.userRepository.findByEmail(email);
    if (user && user.id !== ignoreUserId) {
      this.logger.warn(`Email already in use: ${email}`);
      throw new ConflictException(`Email ${email} already in use`);
    }
  }

  private async validatePhoneNotInUse(phone: string, ignoreUserId?: string) {
    if (!phone) return;
    const user = await this.userRepository.findByPhone(phone);
    if (user && user.id !== ignoreUserId) {
      this.logger.warn(`Phone already in use: ${phone}`);
      throw new ConflictException(`Phone ${phone} already in use`);
    }
  }

  private async resolveCompanyId(data: CreateUserDto): Promise<string> {
    if (data.role !== Role.AGENT) return data.companyId;

    const pro4Tech = await this.companyService.findByCnpj('11.111.111/0001-11');
    if (!pro4Tech) {
      throw new InternalServerErrorException('Pro4Tech company not found');
    }
    return pro4Tech.id;
  }

  private async createUserAgentProfile(
    data: CreateUserDto,
    companyId: string,
    hashedPassword: string,
    userId: string,
  ): Promise<ResponseUserDto> {
    return await this.prisma.$transaction(async (tx) => {
      const user = await this.userRepository.create(
        {
          companyId,
          phone: data.phone,
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: data.role,
        },
        userId,
        tx,
      );

      await tx.agent.create({
        data: {
          user: {
            connect: { id: user.id },
          },
          supportLevel: SupportLevel.LEVEL_1,
          canAnswer: true,
        },
      });
      this.logger.log(`Agent and User created successfully — id: ${user.id}`);
      return user;
    });
  }
}
