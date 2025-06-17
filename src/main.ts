import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // ValidationPipe import edildi
import * as express from 'express'; // Express import edildi

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Avtomatik body parsingi deaktiv edirik
    logger: ['error', 'warn', 'log'], // Ətraflı loglama
  });

  // DÜZƏLİŞ: app.enableCors() konfiqurasiyası
  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? [
          'https://mustafayev-tracksy.netlify.app', // Frontend'in Netlify adresi
          'https://tracksy-backend.onrender.com', // Backend'in Render adresi (bəzən backend özü də öz domenini originə əlavə etməlidir)
        ]
      : ['http://localhost:4200']; // Frontend'in lokal adresi

  app.enableCors({
    origin: allowedOrigins,
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

  // DÜZƏLİŞ: Render'də düzgün dinləmə üçün
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0'); // DÜZƏLİŞ: '0.0.0.0' host əlavə edildi
  console.log(`🚀 Application is running on: http://localhost:${port}`); // Bu log Render'də dəyişməyəcək
}
bootstrap();
