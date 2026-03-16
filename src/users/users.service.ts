import * as bcrypt from 'bcrypt';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Role } from '../auth/enums/role.enum'; 

export interface User {
  userId: number;
  username: string;
  password: string;
  role: Role;
  companyId: number;
  companyName: string;
}
@Injectable()
export class UsersService implements OnModuleInit {
  private users: User[] = [];

  async onModuleInit() {
    
    this.users = [
      {
        userId: 1,
        username: 'admin@empresa.com',
        password: await bcrypt.hash('123456', 10),
        role: Role.Admin,
        companyId: 1,
        companyName: 'Empresa ABC'
      },
      {
        userId: 2,
        username: 'agent@empresa.com',
        password: await bcrypt.hash('123456', 10),
        role: Role.Agent,
        companyId: 1,
        companyName: 'Empresa ABC'
      }
    ];
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async findById(userId: number): Promise<User | undefined> {
    return this.users.find(user => user.userId === userId);
  }
}