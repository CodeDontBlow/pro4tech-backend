import { ResponsePaginationDto } from "@common/dtos/response-pagination.dto";
import { ResponseUserDto } from "@modules/user/dtos/response-user.dto";
import { UserRepository } from "@modules/user/user.repository";
import { Injectable, Logger } from "@nestjs/common";
import { Role } from "generated/prisma/client";


@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async findAll(
    query: {
      page: number,
      limit: number,
    }
  ):Promise<ResponsePaginationDto<ResponseUserDto>> {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const skip = (page - 1) * limit;
    try {
      const admins = await this.userRepository.findAll({
        role: Role.ADMIN,
        skip,
        take: limit,
      });
      
      const [data, total] = await Promise.all([
        this.userRepository.findAll({
          role: Role.ADMIN,
          skip,
          take: limit,
        }),
        this.userRepository.count(Role.ADMIN),
      ]);
      return new ResponsePaginationDto(data, total, page, limit);
    } catch (error) {
      this.logger.error("Error fetching admin users", error);
      throw error;
    }
  }
}