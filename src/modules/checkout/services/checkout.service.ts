import { UserSubscriptionService } from '@/modules/users/services/user-subscription.service';
import { UserService } from '@/modules/users/services/user.service';
import SubscriptionActivated from '@/templates/emails/subscription-activated';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SubscriptionTypes } from '@prisma/client';
import { render } from '@react-email/render';
import { Resend } from 'resend';
import Stripe from 'stripe';

const subscriptionsMapper = {
  [SubscriptionTypes.Pro]: {
    type: SubscriptionTypes.Pro,
    name: 'FeedCatch Pro',
    lineItemId: 'li_1NiHntC5qal6Clj2tOyPMDok',
    priceId: 'price_1NhxyYC5qal6Clj2XDUXPVAs',
  },
};

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  private resend: Resend;
  private stripe: Stripe;

  constructor(
    private userService: UserService,
    private userSubscriptionService: UserSubscriptionService,
  ) {
    this.resend = new Resend(process.env.EMAIL_PROVIDER_API_KEY);
    this.stripe = new Stripe(process.env.PAYMENT_PROVIDER_SECRET_KEY, {
      apiVersion: '2023-08-16',
    });
  }

  async createCheckoutSession({ userId }: { userId: string }) {
    const user = await this.userService.getById(userId);

    const checkoutSession = await this.stripe.checkout.sessions.create({
      customer: user.customerId,
      line_items: [
        {
          price: subscriptionsMapper[SubscriptionTypes.Pro].priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.WEB_APP_DOMAIN}/api/checkout/post?success=true`,
      allow_promotion_codes: true,
    });

    if (!checkoutSession?.url) {
      const e = new InternalServerErrorException('Error on creating checkout');
      this.logger.error(e);
      throw e;
    }

    this.logger.log('Checkout session created');

    await this.userSubscriptionService.createAsNonActive(userId, {
      type: SubscriptionTypes.Pro,
      customerId: user.customerId,
    });

    return { checkoutSessionURL: checkoutSession.url };
  }

  async checkoutWebhook({
    sig,
    payload,
  }: {
    sig: string;
    payload: string | Buffer;
  }) {
    let event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        sig,
        process.env.LOCAL_ENDPOINT_SECRET,
      );
    } catch (err) {
      const e = new BadRequestException(`Webhook Error: ${err.message}`);
      this.logger.error(e.message);
      throw e;
    }

    const session = event.data.object;
    const { status } = session;

    switch (event.type) {
      case 'customer.subscription.deleted':
        this.logger.log(`Event received: ${event.type}`);

        await this.userSubscriptionService.updateStatusFromCustomerId(
          session.customer,
          { active: false },
        );
        this.logger.log(`Subscription status is ${status}.`);
        break;

      case 'customer.subscription.created':
        this.logger.log(`Event received: ${event.type}`);

        this.userSubscriptionService.updateFromCustomerId(session.customer, {
          subscriptionId: session.id,
        });

        this.logger.log(`Subscription status is ${status}.`);
        break;

      // case 'customer.subscription.trial_will_end':
      //   console.log(`Subscription status is ${status}.`);
      //   // Then define and call a method to handle the subscription trial ending.
      //   // handleSubscriptionTrialEnding(subscription);
      //   break;

      case 'customer.subscription.updated':
        this.logger.log(`Event received: ${event.type}`);

        await this.userSubscriptionService.disableAllUserSubscriptions(
          session.customer,
        );
        const subscription =
          await this.userSubscriptionService.updateStatusFromCustomerId(
            session.customer,
            { active: session.status === 'active' },
          );

        this.logger.log(`Subscription status is ${status}.`);

        const user = await this.userService.getByCustomerId(session.customer);

        await this.resend.emails.send({
          from: `${process.env.EMAIL_FROM_TEAM_NAME} <${process.env.EMAIL_FROM_NO_REPLY}>`,
          to: user.email,
          subject: 'Your FeedCatch subscription confirmation',
          html: render(
            SubscriptionActivated({
              product: subscriptionsMapper[subscription.subscriptionType].name,
              price: session.plan.amount,
              startedAt: new Date(session.start_date * 1000),
            }),
          ),
        });

        this.logger.log('Subscription email sent');
        break;
    }
  }
}
