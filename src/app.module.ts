import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { SchemaValidatorGuard } from '@/modules/shared/decorators/schema-validator.decorator';
import { ProjectsModule } from '@/modules/projects/projects.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthValidationGuard } from '@/modules/auth/decorators/auth-validation.decorator';
import { FeedbacksModule } from './modules/feedbacks/feedbacks.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.AUTHENTICATION_SECRET,
    }),
    ProjectsModule,
    AuthModule,
    UsersModule,
    FeedbacksModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: SchemaValidatorGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthValidationGuard,
    },
  ],
})
export class AppModule {}
