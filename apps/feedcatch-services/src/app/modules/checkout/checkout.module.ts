import { Module } from '@nestjs/common';
import { CheckoutService } from './services/checkout.service';
import { CheckoutController } from './controllers/checkout.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [CheckoutService],
  controllers: [CheckoutController],
})
export class CheckoutModule {}
