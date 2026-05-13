import { ResponsePaginationDto } from "@common/dtos/response-pagination.dto";
import { ResponseUserDto } from "@modules/user/dtos/response-user.dto";
import { UserService } from "@modules/user/user.service";
import { Injectable, Logger } from "@nestjs/common";
import { Role } from "generated/prisma/client";

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly userService: UserService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
  }): Promise<ResponsePaginationDto<ResponseUserDto>> {
    this.logger.log(`Listando administradores: ${JSON.stringify(query)}`);
    return this.userService.findAll({
      ...query,
      role: Role.ADMIN,
    });
  }
}