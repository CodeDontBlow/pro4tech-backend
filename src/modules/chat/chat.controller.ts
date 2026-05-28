import {
  BadRequestException,
  Controller,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { AuthUser, UserPayload } from 'src/common/decorators/auth-user.decorator';
import { ChatService } from './chat.service';
import { StorageService } from '@modules/storage/storage.service';

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = Number(process.env.CHAT_UPLOAD_MAX_MB ?? 10);
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-7z-compressed',
  'application/x-rar-compressed',
]);

@ApiTags('chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly storageService: StorageService,
  ) {}

  @Post(':ticketId/attachments')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', MAX_FILES, {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
          return cb(
            new BadRequestException('Tipo de arquivo não permitido'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadAttachments(
    @AuthUser() user: UserPayload,
    @Param('ticketId') ticketId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    await this.chatService.assertCanAccessTicket(ticketId, user);

    const uploads = await Promise.all(
      files.map((file) =>
        this.storageService.uploadBuffer({
          buffer: file.buffer,
          mimeType: file.mimetype,
          originalName: file.originalname,
          prefix: `chat/${ticketId}`,
        }),
      ),
    );

    return {
      attachments: uploads,
    };
  }
}
