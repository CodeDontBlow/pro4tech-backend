import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client as MinioClient } from 'minio';
import { v7 as uuidv7 } from 'uuid';
import path from 'node:path';

export type UploadedFileOutput = {
  key: string;
  url: string;
  size: number;
  mimeType: string;
  originalName: string;
};

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: MinioClient;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor() {
    const endpoint = process.env.MINIO_ENDPOINT ?? 'localhost';
    const port = Number(process.env.MINIO_PORT ?? 9000);
    const useSSL = String(process.env.MINIO_USE_SSL ?? 'false') === 'true';
    const accessKey = process.env.MINIO_ACCESS_KEY ?? '';
    const secretKey = process.env.MINIO_SECRET_KEY ?? '';

    this.bucket = process.env.MINIO_BUCKET ?? 'pro4tech';
    this.publicUrl =
      process.env.MINIO_PUBLIC_URL ?? `http://${endpoint}:${port}`;

    this.client = new MinioClient({
      endPoint: endpoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });
  }

  async onModuleInit() {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket);
      }

      const shouldSetPublic =
        String(process.env.MINIO_SET_PUBLIC ?? 'true') === 'true';
      if (shouldSetPublic) {
        await this.client.setBucketPolicy(
          this.bucket,
          JSON.stringify({
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: { AWS: ['*'] },
                Action: ['s3:GetObject'],
                Resource: [`arn:aws:s3:::${this.bucket}/*`],
              },
            ],
          }),
        );
      }
    } catch (error) {
      this.logger.error('Failed to initialize MinIO bucket', error as Error);
    }
  }

  async uploadBuffer(input: {
    buffer: Buffer;
    mimeType: string;
    originalName: string;
    prefix: string;
  }): Promise<UploadedFileOutput> {
    const extension =
      path.extname(input.originalName) || this.guessExtension(input.mimeType);

    const safePrefix = input.prefix.replace(/^\/+/, '').replace(/\/+$/, '');
    const objectName = `${safePrefix}/${uuidv7()}${extension}`;

    await this.client.putObject(
      this.bucket,
      objectName,
      input.buffer,
      input.buffer.length,
      {
        'Content-Type': input.mimeType,
      },
    );

    return {
      key: objectName,
      url: `${this.publicUrl}/${this.bucket}/${objectName}`,
      size: input.buffer.length,
      mimeType: input.mimeType,
      originalName: input.originalName,
    };
  }

  private guessExtension(mimeType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'image/svg+xml': '.svg',
      'application/pdf': '.pdf',
    };

    return map[mimeType] ?? '';
  }
}
