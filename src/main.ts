import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { PrismaClientExceptionFilter } from '@common/filters/prisma-client-exception.filter';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';
import { getSwaggerCustomOptions } from './utils/swagger.util';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Pro4Tech API')
    .setDescription('Documentação da API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, getSwaggerCustomOptions());

  const port = process.env.PORT ?? 3333;

  try {
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}/api`);
  } catch (error) {
    const listenError = error as NodeJS.ErrnoException;

    if (listenError.code === 'EADDRINUSE') {
      logger.error(
        `Port ${port} is already in use. Stop the other backend process or change PORT in .env.`,
      );
      process.exit(1);
    }

    throw error;
  }
}
bootstrap();
