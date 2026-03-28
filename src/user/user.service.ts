import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

//repositories
import { UserRepository } from './user.repository';

//dtos
import { ResponseUserDto } from './dtos/response-user.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository) {}

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

  async findByEmailForAuth(email: string) {
    return this.userRepository.findByEmailWithPassword(email);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.updateLastLogin(id);
  }

  async create(data: CreateUserDto): Promise<ResponseUserDto> {
    await this.validateEmailNotInUse(data.email);
    await this.validatePhoneNotInUse(data.phone);

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    this.logger.log(`User created — id: ${user.id}`);
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
    await this.findById(id);
    const user = await this.userRepository.softDelete(id);
    this.logger.log(`User soft deleted — id: ${id}`);
    return user;
  }
}
