// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    logger: ['error', 'warn', 'log'],
  });

  // DÜZƏLİŞ: app.enableCors() konfiqurasiyası
  app.enableCors({
    origin: [
      'http://localhost:4200', // Frontend'in lokal adresi
      'https://mustafayev-tracksy.netlify.app', // Sizin Netlify adresi
      'https://tracksy-mj86.onrender.com', // Sizin Render frontend adresi (əgər frontend də Renderdədirsə)
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Bütün HTTP metodlarına icazə ver
    credentials: true, // `Authorization` header'i və ya cookie kimi credentials göndərməyə icazə ver
  });

  // Əl ilə JSON body parser middleware-ni əlavə edirik
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Qlobal ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
