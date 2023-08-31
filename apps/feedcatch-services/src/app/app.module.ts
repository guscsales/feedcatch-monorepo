import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { SchemaValidatorGuard } from '@services/src/app/modules/shared/decorators/schema-validator.decorator';
import { ProjectsModule } from '@services/src/app/modules/projects/projects.module';
import { AuthModule } from '@services/src/app/modules/auth/auth.module';
import { UsersModule } from '@services/src/app/modules/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthValidationGuard } from '@services/src/app/modules/auth/decorators/auth-validation.decorator';
import { FeedbacksModule } from './modules/feedbacks/feedbacks.module';
import { CheckoutModule } from './modules/checkout/checkout.module';

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
    CheckoutModule,
  ],
  providers: [
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
