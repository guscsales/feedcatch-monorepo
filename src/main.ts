import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import helmet from 'helmet';
import { nestCsrf } from 'ncsrf';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(cookieParser());
  app.use(nestCsrf());
  app.enableCors();

  await app.listen(3000);
}
bootstrap();
