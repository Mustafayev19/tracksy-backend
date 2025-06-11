import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Render və digər hostlar üçün CORS açıq olmalıdır
  app.enableCors({
    origin: '*', // təhlükəsizliyə görə sonradan bura konkret URL qoymaq olar
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
