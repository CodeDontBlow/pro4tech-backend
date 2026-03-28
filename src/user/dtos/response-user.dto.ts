import { Role, ChatStatus } from 'generated/prisma/client';

export class ResponseUserDto {
  id: string;

  companyId: string;

  phone?: string;

  email: string;

  name: string;

  role: Role;

  chatStatus: ChatStatus;

  lastSeen?: Date;

  isActive: boolean;

  lastLogin?: Date;
}