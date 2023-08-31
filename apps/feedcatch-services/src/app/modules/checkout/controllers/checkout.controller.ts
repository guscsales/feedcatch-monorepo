import {
  BadRequestException,
  Controller,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { CheckoutService } from '../services/checkout.service';
import { PublicRoute } from '@services/src/app/modules/auth/decorators/auth-validation.decorator';

@Controller('checkout')
export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}

  @Post('/create-session')
  async createCheckoutSession(@Req() req) {
    const data = await this.checkoutService.createCheckoutSession({
      userId: req.authUser.userId,
    });

    return data;
  }

  @PublicRoute()
  @Post('/webhook')
  async checkoutWebhook(@Req() req: RawBodyRequest<Request>) {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    this.checkoutService.checkoutWebhook({ sig, payload: req.rawBody });
  }
}
