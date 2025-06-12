// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express'; // Express import edildi

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Avtomatik body parsingi deaktiv edirik
    logger: ['error', 'warn', 'log'], // Ətraflı loglama
  });

  app.enableCors({
    origin: '*',
  });

  // Əl ilə JSON body parser middleware-ni əlavə edirik
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Qlobal ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO-da olmayan sahələri silir
      forbidNonWhitelisted: false, // Əlavə sahələrə icazə verir, lakin onları silir (əvvəlki "property 0" xətasını həll edən)
      transform: true, // Gələn payloadu DTO sinfinə çevirir
      transformOptions: {
        enableImplicitConversion: true, // Tipləri avtomatik çevirir (number string -> number)
      },
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
