import { Injectable } from '@nestjs/common';

//services
import { PrismaService } from 'src/database/prisma/prisma.service';

//dtos
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ResponseUserDto } from './dtos/response-user.dto';

const userPublicSelect = {
  id: true,
  companyId: true,
  phone: true,
  email: true,
  name: true,
  role: true,
  chatStatus: true,
  lastSeen: true,
  isActive: true,
  lastLogin: true,
};

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ResponseUserDto | null> {
    return this.prisma.user.findUnique({
      where: { id: id, deletedAt: null },
      select: userPublicSelect,
    });
  }

  async findByEmailWithPassword(
    email: string,
  ): Promise<(ResponseUserDto & { hashedPassword: string }) | null> {
    return this.prisma.user.findUnique({
      where: { email: email, deletedAt: null },
      select: {
        id: true,
        email: true,
        hashedPassword: true,
        chatStatus: true,
        role: true,
        companyId: true,
        name: true,
        isActive: true,
      },
    });
  }

  async findByEmail(email: string): Promise<ResponseUserDto | null> {
    return this.prisma.user.findUnique({
      where: { email: email, deletedAt: null },
      select: userPublicSelect,
    });
  }

  async findByPhone(phone: string): Promise<ResponseUserDto | null> {
    return this.prisma.user.findUnique({
      where: { phone: phone, deletedAt: null },
      select: userPublicSelect,
    });
  }

  async create(data: CreateUserDto & { id: string }): Promise<ResponseUserDto> {
    return this.prisma.user.create({
      data: {
        id: data.id,
        companyId: data.companyId,
        phone: data.phone,
        email: data.email,
        hashedPassword: data.password,
        name: data.name,
        role: data.role ?? 'CLIENT',
      },
      select: userPublicSelect,
    });
  }

  async update(id: string, data: UpdateUserDto): Promise<ResponseUserDto> {
    return this.prisma.user.update({
      where: { id: id },
      data: {
        name: data.name,
        phone: data.phone,
        chatStatus: data.chatStatus,
        isActive: data.isActive,
      },
      select: userPublicSelect,
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: id },
      data: { lastLogin: new Date() },
    });
  }

  async softDelete(id: string): Promise<ResponseUserDto> {
    return this.prisma.user.update({
      where: { id: id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
      select: userPublicSelect,
    });
  }
}
