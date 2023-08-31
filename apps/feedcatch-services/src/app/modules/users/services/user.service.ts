import { DatabaseService } from '@services/src/app/modules/shared/database/database.service';
import { Injectable, Logger, NotAcceptableException } from '@nestjs/common';
import { UserSubscriptionService } from './user-subscription.service';
import { SubscriptionTypes } from '@prisma/client';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private databaseService: DatabaseService,
    private userSubscriptionService: UserSubscriptionService
  ) {}

  async getByEmail(email: string) {
    const data = await this.databaseService.user.findUnique({
      where: { email },
    });

    return data;
  }

  async getById(id: string) {
    const [user, userSubscription] = await Promise.all([
      this.databaseService.user.findUnique({
        where: { id },
      }),
      this.databaseService.userSubscription.findFirst({
        where: {
          userId: id,
          active: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return { ...user, subscriptionType: userSubscription?.subscriptionType };
  }

  async getByCustomerId(customerId: string) {
    const data = await this.databaseService.user.findUnique({
      where: { customerId },
    });

    return data;
  }

  async userExists(id: string) {
    const userCount = await this.databaseService.user.count({
      where: { id },
    });

    return userCount > 0;
  }

  async createFromEmail({
    email,
    customerId,
  }: {
    email: string;
    customerId: string;
  }) {
    const [userEmailExists, userCustomerIdExists] = await Promise.all([
      this.getByEmail(email),
      this.getByCustomerId(customerId),
    ]);

    if (userEmailExists || userCustomerIdExists) {
      const e = new NotAcceptableException('User email already exists');
      this.logger.error(e.message);
      throw e;
    }

    const data = await this.databaseService.user.create({
      data: {
        email,
        customerId,
      },
    });
    await this.userSubscriptionService.createAsNonActive(data.id, {
      type: SubscriptionTypes.Free,
      customerId: data.customerId,
    });

    return data;
  }
}
