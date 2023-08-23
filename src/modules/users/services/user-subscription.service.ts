import { DatabaseService } from '@/modules/shared/database/database.service';
import { Injectable, Logger } from '@nestjs/common';
import { SubscriptionTypes } from '@prisma/client';

@Injectable()
export class UserSubscriptionService {
  private readonly logger = new Logger(UserSubscriptionService.name);

  constructor(private databaseService: DatabaseService) {}

  async createAsNonActive(
    userId: string,
    {
      type,
      customerId,
    }: {
      type: SubscriptionTypes;
      customerId: string;
    },
  ) {
    const data = await this.databaseService.userSubscription.create({
      data: {
        active: false,
        subscriptionType: type,
        customerId,
        userId,
      },
    });

    this.logger.log(`User ${userId}: subscription created`);

    return data;
  }

  async disableAllUserSubscriptions(customerId: string) {
    const items = await this.databaseService.userSubscription.updateMany({
      data: { active: false },
      where: { customerId },
    });

    this.logger.log(`User: all user subscriptions deactivated`);

    return items;
  }

  async updateStatusFromCustomerId(
    customerId: string,
    {
      active,
    }: {
      active: boolean;
    },
  ) {
    const lastUserSubscription =
      await this.databaseService.userSubscription.findFirst({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
      });

    const data = await this.databaseService.userSubscription.update({
      where: {
        id: lastUserSubscription.id,
      },
      data: {
        active,
      },
    });

    this.logger.log(
      `User ${lastUserSubscription.userId}: user subscription status updated`,
    );

    return data;
  }

  async updateFromCustomerId(
    customerId: string,
    {
      subscriptionId,
    }: {
      subscriptionId: string;
    },
  ) {
    const lastUserSubscription =
      await this.databaseService.userSubscription.findFirst({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
      });

    const data = await this.databaseService.userSubscription.update({
      where: {
        id: lastUserSubscription.id,
      },
      data: {
        subscriptionId,
      },
    });

    this.logger.log(
      `User ${lastUserSubscription.userId}: user subscription updated`,
    );

    return data;
  }
}
